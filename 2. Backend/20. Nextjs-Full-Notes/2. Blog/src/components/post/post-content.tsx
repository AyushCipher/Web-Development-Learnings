// Also a plain Server Component (rendered from the async
// src/app/post/[slug]/page.tsx). `isAuthor` is computed server-side there
// (by comparing the session user id to post.authorId) and passed down as a
// prop - the Edit/Delete controls only exist in the server-rendered output
// at all when the viewer is the author, they aren't hidden via CSS.
// DeletePostButton nested inside is itself a "use client" component, which
// is fine to render from a Server Component parent.
import { PostContentProps } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";
import DeletePostButton from "./delete-post-button";

function PostContent({ post, isAuthor }: PostContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">{post.title}</CardTitle>
        <CardDescription>
          By {post.author.name} - {formatDate(post.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-lg mb-6">{post.description}</p>
        <p className="text-black font-bold text-4xl mb-6">{post.content}</p>
      </CardContent>
      {isAuthor && (
        <CardFooter>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/post/edit/${post.slug}`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <DeletePostButton postId={post.id} />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default PostContent;
