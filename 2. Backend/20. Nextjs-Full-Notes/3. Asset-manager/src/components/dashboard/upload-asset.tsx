"use client";
// "use client" is required here for local UI state (dialog open/close,
// form fields, upload progress) and for XMLHttpRequest, which only exists
// in the browser.
//
// This component drives the whole UPLOAD flow's client side:
//   1. getCloudinarySignature() calls the Route Handler at
//      src/app/api/cloudinary/signature/route.ts to get a short-lived,
//      server-signed signature (the server never sees the file bytes).
//   2. handleAssetUpload uploads the raw file directly from THIS BROWSER to
//      Cloudinary's API using that signature - our server is never in the
//      path for the actual file bytes, only for producing the signature.
//   3. Once Cloudinary responds with the hosted file's URL, this component
//      calls the Server Action `uploadAssetAction`
//      (src/actions/dashboard-actions.ts) with just the metadata + that
//      URL to persist the asset record (isApproved: "pending", awaiting
//      admin review in src/app/admin/asset-approval/page.tsx).
import { DollarSign, ImagePlus, Plus, Upload } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { uploadAssetAction } from "@/actions/dashboard-actions";

type Category = {
  id: number;
  name: string;
  createdAt: Date;
};

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  price: string;
  file: File | null;
};

type CloudinarySignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
};

interface UploadDialogProps {
  categories: Category[];
}

function UploadAsset({ categories }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    title: "",
    description: "",
    categoryId: "",
    price: "5",
    file: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };


  const handleCategoryChange = (value: string) => {
    setFormState((prev) => ({ ...prev, categoryId: value }));
  };

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormState((prev) => ({ ...prev, file }));
    }
  };

  
  // Calls our own Route Handler (a same-origin relative fetch, not a
  // Server Action) - this endpoint needs to be a real HTTP route because
  // it's hit before we have a File object suitable for a server action's
  // FormData payload, and because it's simplest to keep the raw XHR upload
  // (below) fully separate from any Server Action mechanics.
  async function getCloudinarySignature(): Promise<CloudinarySignature> {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const response = await fetch("/api/cloudinary/signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      throw new Error("Failed to create cloudinary signature");
    }

    return response.json();
  }


  const handleAssetUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsUploading(true);
    setUploadProgressStatus(0);
    try {
      const { signature, apiKey, timestamp } = await getCloudinarySignature();

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", formState.file as File);
      cloudinaryData.append("api_key", apiKey);
      cloudinaryData.append("timestamp", timestamp.toString());
      cloudinaryData.append("signature", signature);
      cloudinaryData.append("folder", "next-full-course-asset-manager");

      // Raw XMLHttpRequest instead of fetch() specifically because `fetch`
      // has no built-in upload-progress event - `xhr.upload.onprogress`
      // below is what powers the progress bar in the UI. This request goes
      // straight to Cloudinary's own API (api.cloudinary.com), not to
      // anything in this Next.js app.
      //
      // NEXT_PUBLIC_ prefix note: Next.js only inlines env vars prefixed
      // `NEXT_PUBLIC_` into the client JS bundle at build time; unprefixed
      // vars (like CLOUDINARY_API_SECRET, used only in the signature Route
      // Handler) stay server-only and simply don't exist here. That's the
      // actual reason the secret-requiring part of this flow had to be
      // split into its own server endpoint.
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgressStatus(progress);
        }
      };

      const cloudinaryPromise = new Promise<any>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error("Upload to cloudinary failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload to cloudinary failed"));
      });

      xhr.send(cloudinaryData);

      const cloudinaryResponse = await cloudinaryPromise;
      console.log(cloudinaryResponse, "cloudinaryResponse");

      const formData = new FormData();
      formData.append("title", formState.title);
      formData.append("description", formState.description);
      formData.append("categoryId", formState.categoryId);
      formData.append("price", formState.price);
      formData.append("fileUrl", cloudinaryResponse.secure_url);
      formData.append("thumbnailUrl", cloudinaryResponse.secure_url);

      // Calling the Server Action like a normal async function - no manual
      // fetch/XHR here. Next.js transparently turns this into a POST to a
      // generated endpoint and returns the action's result once it
      // finishes on the server. This is where the file's Cloudinary URL
      // (not the file itself) finally reaches server-side code.
      const result = await uploadAssetAction(formData);
      if (result.success) {
        setOpen(false);
        setFormState({
          title: "",
          description: "",
          categoryId: "",
          price: "5",
          file: null,
        });
      } else {
        throw new Error(result?.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      setUploadProgressStatus(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
          <Plus className="mr-2 w-4 h-4" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ImagePlus className="h-5 w-5" />
            </span>
            Upload New Asset
          </DialogTitle>
          <DialogDescription>
            Add a preview, category, and the price buyers will pay at checkout.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAssetUpload} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                value={formState.title}
                onChange={handleInputChange}
                id="title"
                name="title"
                placeholder="Brand kit mockups"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={formState.price}
                  onChange={handleInputChange}
                  id="price"
                  name="price"
                  type="number"
                  min="1"
                  max="10000"
                  step="0.01"
                  placeholder="5.00"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what buyers will receive"
              value={formState.description}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={handleCategoryChange}
              value={formState.categoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              onChange={handleFileChange}
              type="file"
              id="file"
              accept="image/*"
            />
          </div>
          {isUploading && uploadProgressStatus > 0 && (
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgressStatus}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {uploadProgressStatus}% uploaded
              </p>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isUploading || !formState.file}>
              <Upload className="mr-2 h-5 w-5" />
              {isUploading ? "Uploading..." : "Upload Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UploadAsset;
