// No "use client" here - this stays a Server Component, rendered directly
// from the Home Server Component's post list. It's purely presentational
// (no hooks/handlers), so there's no need to pay the client-bundle cost of
// hydrating it.
import { PostCardProps } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

function PostCard({ post }: PostCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Link className="hover:underline" href={`/post/${post.slug}`}>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
        </Link>
        <CardDescription>
          By {post.author.name} - {formatDate(post.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{post.description}</p>
      </CardContent>
    </Card>
  );
}

export default PostCard;
