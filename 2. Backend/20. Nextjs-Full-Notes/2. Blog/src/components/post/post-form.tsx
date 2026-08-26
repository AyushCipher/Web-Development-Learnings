// Client Component shared by both /post/create and /post/edit/[slug]
// (via the `isEditing`/`post` props). "use client" is needed for
// react-hook-form's hooks and useTransition. This form does its own zod
// validation client-side for instant feedback, THEN manually builds a
// FormData object and calls the createPost/updatePost Server Action -
// it does not rely on the browser's native <form action={serverAction}>
// submission (which Next.js also supports and would work without JS, but
// wouldn't give this component control over client-side validation
// timing/UI the way this manual approach does).
"use client";

import { z } from "zod";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { createPost, updatePost } from "@/actions/post-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// post form schema for validation
const postSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 2 characters long")
    .max(255, "Title must be less than 255 characters"),
  description: z.string()
    .min(5, "Description must be at least 2 characters long")
    .max(255, "Description must be less than 255 characters"),
  content: z.string().min(10, "Description must be at least 2 characters long"),
});

interface PostFormProps {
  isEditing?: boolean;
  post?: {
    id: number;
    title: string;
    description: string;
    content: string;
    slug: string;
  };
}

type PostFormValues = z.infer<typeof postSchema>;

function PostForm({ isEditing, post }: PostFormProps) {
  // useTransition marks the Server Action call as a non-blocking
  // ("transition") update - React keeps the UI responsive while it's
  // pending and exposes `isPending` to drive the Saving/disabled state
  // below, without needing a manually managed `isLoading` useState like
  // the auth forms use for their (non-Server-Action) API calls.
  const [isPending, startTranstion] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues:
      isEditing && post
        ? {
            title: post.title,
            description: post.description,
            content: post.content,
          }
        : {
            title: "",
            description: "",
            content: "",
          },
  });

  const onFormSubmit = async (data: PostFormValues) => {
    // startTransition's callback can be async; React tracks it as pending
    // until the returned promise settles. The Server Action calls inside
    // (createPost/updatePost) are plain async function calls from this
    // Client Component's point of view - Next.js handles turning them into
    // network requests to the server transparently.
    startTranstion(async () => {
      try {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("content", data.content);

        let res;

        if (isEditing && post) {
          res = await updatePost(post.id, formData);
        } else {
          res = await createPost(formData);
        }

        console.log(res, "res");

        if (res.success) {
          toast(
            isEditing ? "Post edited successfully" : "Post created successfully"
          );
          // revalidatePath already ran server-side inside the action;
          // refresh() + push() here just make sure this client's own view
          // picks up the fresh data as it navigates back to the homepage.
          router.refresh();
          router.push("/");
        } else {
          toast(res.message);
        }
      } catch (e) {
        toast("Failed to create post");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter post title"
          {...register("title")}
          disabled={isPending}
        />
        {errors?.title && (
          <p className="text-sm text-red-700">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a short post description"
          {...register("description")}
          disabled={isPending}
        />
        {errors?.description && (
          <p className="text-sm text-red-700">{errors.description.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          placeholder="Enter post content"
          className="min-h-[250px] resize-none"
          {...register("content")}
          disabled={isPending}
        />
        {errors?.content && (
          <p className="text-sm text-red-700">{errors.content.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending} className="mt-5 w-full">
        {isPending
          ? "Saving Post..."
          : isEditing
            ? "Update Post"
            : "Create Post"}
      </Button>
    </form>
  );
}

export default PostForm;
