import { Metadata } from "next";

const dummyData = {
  "1": {
    title: "One",
  },
  "2": {
    title: "Two",
  },
  "3": {
    title: "Three",
  },
};

// DYNAMIC METADATA: `generateMetadata` receives the same `params` (and
// `searchParams`) as the page component, lets you fetch/look up data, and
// returns the Metadata object for THIS specific slug (e.g. "One" vs "Two").
// Next.js runs this on the server before rendering, so the correct <title>
// is present in the initial HTML - useful for link-preview cards, sharing, SEO.
// It can also be async and call a real database/API, not just dummyData like here.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = dummyData[slug as keyof typeof dummyData];

  return {
    title: data.title,
    description: data.title,
  };
}

export default async function DynamicMetadataExample({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = dummyData[slug as keyof typeof dummyData];

  return (
    <div>
      <h1>{data.title}</h1>
    </div>
  );
}
