jest.mock("../src/models/Media");
jest.mock("../src/utils/cloudinary");

const Media = require("../src/models/Media");
const { uploadMediaToCloudinary } = require("../src/utils/cloudinary");
const { uploadMedia, getAllMedias } = require("../src/controllers/media-controller");

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("media-controller", () => {
  let saveMock;

  beforeEach(() => {
    jest.clearAllMocks();
    // The automocked Media constructor doesn't replicate the real
    // mongoose model's behavior of assigning constructor args onto the
    // instance, so give it an implementation that does, plus a mockable
    // `save`.
    saveMock = jest.fn().mockResolvedValue(undefined);
    Media.mockImplementation(function (data) {
      Object.assign(this, data);
      this.save = saveMock;
    });
  });

  describe("uploadMedia", () => {
    it("uploads the file, saves it, and returns 201 with success and url", async () => {
      const req = {
        user: { userId: "user1" },
        file: {
          originalname: "photo.png",
          mimetype: "image/png",
          buffer: Buffer.from("fake-file-content"),
        },
      };
      const res = buildRes();

      uploadMediaToCloudinary.mockResolvedValue({
        public_id: "abc",
        secure_url: "http://cloudinary.example/abc.png",
      });

      await uploadMedia(req, res);

      expect(uploadMediaToCloudinary).toHaveBeenCalledWith(req.file);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          url: "http://cloudinary.example/abc.png",
        })
      );
    });

    it("returns 400 and does not call cloudinary upload when no file is present", async () => {
      const req = {
        user: { userId: "user1" },
        file: undefined,
      };
      const res = buildRes();

      await uploadMedia(req, res);

      expect(uploadMediaToCloudinary).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("getAllMedias", () => {
    // Regression test: getAllMedias used to never send a response on the
    // success path, leaving the client hanging forever. Assert res.json is
    // actually called with the media list.
    it("responds with success and the media list when medias are found", async () => {
      const req = { user: { userId: "user1" } };
      const res = buildRes();
      const media = [{ _id: "1", url: "http://example.com/1.png" }];

      Media.find = jest.fn().mockResolvedValue(media);

      await getAllMedias(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, media })
      );
    });

    it("returns 404 when no medias are found for the user", async () => {
      const req = { user: { userId: "user1" } };
      const res = buildRes();

      Media.find = jest.fn().mockResolvedValue([]);

      await getAllMedias(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });
});
