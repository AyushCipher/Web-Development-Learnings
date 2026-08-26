// No "use client" - purely presentational, renders whatever `assets` it's
// given as props. Because it has no interactivity, it can stay a Server
// Component even though it's rendered from src/app/dashboard/assets/page.tsx
// alongside the "use client" UploadAsset dialog next to it.
import Image from "next/image";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from "date-fns";
import { formatPriceFromCents } from "@/lib/utils";

type Asset = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  fileUrl: string;
  isApproved: string;
  categoryId: number | null;
  createdAt: Date;
};

interface AssetGridProps {
  assets: Asset[];
}

function AssetGrid({ assets }: AssetGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className="panel overflow-hidden rounded-lg transition-shadow hover:shadow-md"
        >
          <div className="h-48 bg-muted relative">
            <Image
              src={asset.fileUrl}
              alt={asset.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              <Badge
                className={
                  asset.isApproved === "approved"
                    ? "bg-primary"
                    : asset.isApproved === "rejected"
                    ? "bg-destructive"
                    : "bg-amber-500 text-white"
                }
                variant={"default"}
              >
                {asset.isApproved === "approved"
                  ? "Approved"
                  : asset.isApproved === "rejected"
                  ? "Rejected"
                  : "Pending"}
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold truncate">{asset.title}</h3>
              <span className="rounded-md bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">
                {formatPriceFromCents(asset.price)}
              </span>
            </div>
            {asset.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {asset.description}
              </p>
            )}
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(asset.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssetGrid;
