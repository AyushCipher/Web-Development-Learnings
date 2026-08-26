import {
  getCategoriesAction,
  getPublicAssetsAction,
} from "@/actions/dashboard-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { formatPriceFromCents } from "@/lib/utils";
import { ArrowRight, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Public gallery LIST page. Same Promise-based `searchParams` + Suspense
// streaming pattern as src/app/gallery/[id]/page.tsx (see the detailed
// comments there) - `?category=<id>` drives the category filter buttons
// rendered below via plain <Link> navigations (no client-side state/JS
// needed to filter).
interface GalleryPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

async function GalleryPage({ searchParams }: GalleryPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session && session?.user?.role === "admin") redirect("/");

  // `searchParams` is a Promise in Next.js 15 and must be awaited.
  const resolvedSearchParams = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[65vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <GalleryContent searchParams={resolvedSearchParams} />
    </Suspense>
  );
}

export default GalleryPage;

async function GalleryContent({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const categoryId = searchParams.category
    ? Number.parseInt(searchParams.category)
    : undefined;

  const categories = await getCategoriesAction();
  const assets = await getPublicAssetsAction(categoryId);

  return (
    <div className="min-h-screen pb-14">
      <section className="border-b bg-secondary/45">
        <div className="page-shell py-10">
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-4 bg-background">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Curated marketplace
            </Badge>
            <h1 className="text-4xl font-bold tracking-normal">Gallery</h1>
            <p className="mt-3 text-muted-foreground">
              Browse approved digital assets and purchase them at creator-set
              prices.
            </p>
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur">
        <div className="page-shell flex gap-2 overflow-x-auto py-3">
          <Button
            variant={!categoryId ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/gallery">All</Link>
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              variant={categoryId === c.id ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/gallery?category=${c.id}`}>{c.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="page-shell py-10">
        {assets.length === 0 ? (
          <div className="panel flex min-h-[320px] flex-col items-center justify-center rounded-lg p-8 text-center">
            <ImageIcon className="mb-4 h-10 w-10 text-muted-foreground" />
            <h2 className="text-xl font-semibold">No assets available</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Approved assets will appear here as soon as creators publish them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {assets.map(({ asset, categoryName, userName }) => (
              <Link
                href={`/gallery/${asset.id}`}
                key={asset.id}
                className="group block"
              >
                <div className="panel overflow-hidden rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={asset.fileUrl}
                      alt={asset.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-md bg-background/90 px-3 py-1.5 text-sm font-bold shadow-sm backdrop-blur">
                        {formatPriceFromCents(asset.price)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{asset.title}</h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {userName}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    {categoryName && (
                      <Badge variant="secondary">{categoryName}</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
