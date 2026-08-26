// Client Component that calls a Server Action (deletePost) imperatively
// from an onClick handler - not via a <form action={...}>. This is the
// other valid way to invoke a Server Action: import it like a normal async
// function and `await` it anywhere in client code (React/Next.js compiles
// it to a network call under the hood either way). Contrast with
// post-form.tsx, which builds a FormData object and calls the action
// inside a useTransition.
"use client";

import { DeletePostButtonProps } from "@/lib/types";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { deletePost } from "@/actions/post-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function DeletePostButton({ postId }: DeletePostButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deletePost(postId);
      if (res.success) {
        toast(res.message);
        router.push("/");
        // The Server Action already called revalidatePath("/") itself
        // (see post-actions.ts), which invalidates the Next.js cache for
        // that route; router.refresh() here forces this client to
        // immediately re-request the now-invalidated Server Component data
        // rather than waiting for a future natural navigation to pick it
        // up.
        router.refresh();
      } else {
        toast(res.message);
      }
    } catch (e) {
      toast("An error ocurred while deleting the post! Please try again");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        disabled={isDeleting}
        onClick={handleDelete}
        variant="destructive"
        size="sm"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </>
  );
}

export default DeletePostButton;
