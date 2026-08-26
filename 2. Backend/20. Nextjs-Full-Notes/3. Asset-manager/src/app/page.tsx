// `/` (root route) - a fully static Server Component: no `async`, no
// `auth.api.getSession()`, no DB calls. It's server-rendered (as every
// component here is by default in the App Router), but there's nothing
// dynamic about it, so it's effectively free to render/cache. Contrast with
// src/app/gallery/page.tsx, which looks similar but does real per-request
// data fetching + auth checks.
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Images,
  Layers3,
  Package,
  ShieldCheck,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    title: "Curated uploads",
    description: "Creators submit image assets with category, price, and preview metadata.",
    icon: Upload,
  },
  {
    title: "Approval workflow",
    description: "Admins review submissions before they reach the public gallery.",
    icon: ShieldCheck,
  },
  {
    title: "Instant access",
    description: "Buyers can purchase, download, and retrieve invoices from one account.",
    icon: BadgeDollarSign,
  },
];

const stats = [
  { label: "Upload review", value: "Admin" },
  { label: "Creator pricing", value: "Custom" },
  { label: "Delivery", value: "Instant" },
];

export default function Home() {
  return (
    <div>
      <section className="overflow-hidden border-b bg-background">
        <div className="page-shell grid min-h-[calc(100vh-64px)] items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
              <Package className="h-4 w-4 text-primary" />
              Professional digital asset marketplace
            </div>
            <h1 className="text-4xl font-bold tracking-normal text-foreground sm:text-5xl lg:text-6xl">
              Asset Platform
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Upload polished visual assets, set your own price, manage approvals,
              and give buyers a clean purchase-to-download experience.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/gallery">
                  Browse Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/assets">Upload Assets</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border bg-card p-4 shadow-sm">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg border bg-card shadow-2xl">
              <Image
                src="/hero-asset-marketplace.png"
                alt="Digital asset marketplace workspace"
                width={1400}
                height={1000}
                className="aspect-[1.35] w-full object-cover"
                priority
              />
              <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-3">
                {["Preview", "Price", "Approve"].map((label) => (
                  <div
                    key={label}
                    className="rounded-md border border-white/20 bg-black/55 px-3 py-2 text-sm font-medium text-white backdrop-blur"
                  >
                    <CheckCircle2 className="mr-2 inline h-4 w-4 text-teal-300" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/45 py-14">
        <div className="page-shell">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-primary">
                Built for clean asset commerce
              </p>
              <h2 className="mt-2 text-3xl font-bold">Everything has a clear place.</h2>
            </div>
            <p className="max-w-xl text-muted-foreground">
              The app now feels like a focused operations tool for creators, buyers,
              and admins instead of a bare starter page.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ title, description, icon: Icon }) => (
              <div key={title} className="panel rounded-lg p-6">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="page-shell grid gap-6 md:grid-cols-2">
          <div className="panel rounded-lg p-6">
            <Layers3 className="mb-5 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Creator dashboard</h2>
            <p className="mt-3 text-muted-foreground">
              Uploads, pricing, categories, and review status are visible in one
              sharp workspace.
            </p>
          </div>
          <div className="panel rounded-lg p-6">
            <Images className="mb-5 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Marketplace gallery</h2>
            <p className="mt-3 text-muted-foreground">
              Buyers can browse category filters, inspect premium previews, and
              purchase assets at the price set by the creator.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
