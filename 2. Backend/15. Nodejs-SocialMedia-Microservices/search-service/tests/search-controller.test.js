jest.mock("../src/models/Search");

const Search = require("../src/models/Search");
const { searchPostController } = require("../src/controllers/search-controller");

describe("searchPostController", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      query: { query: "hello" },
      redisClient: {
        get: jest.fn(),
        setex: jest.fn(),
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  it("returns cached results and does not query mongo on cache hit", async () => {
    const cached = [{ postId: "1" }];
    req.redisClient.get.mockResolvedValue(JSON.stringify(cached));

    await searchPostController(req, res);

    expect(req.redisClient.get).toHaveBeenCalledWith("search:hello");
    expect(res.json).toHaveBeenCalledWith(cached);
    expect(Search.find).not.toHaveBeenCalled();
  });

  it("queries mongo and caches results on cache miss", async () => {
    req.redisClient.get.mockResolvedValue(null);
    const results = [{ postId: "1" }];
    const limitMock = jest.fn().mockResolvedValue(results);
    const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
    Search.find.mockReturnValue({ sort: sortMock });

    await searchPostController(req, res);

    expect(Search.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(results);
    expect(req.redisClient.setex).toHaveBeenCalledWith(
      "search:hello",
      300,
      JSON.stringify(results)
    );
  });
});
