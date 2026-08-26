// Shared by both the standalone page (photos/[id]/page.tsx) and the
// intercepted modal (@modal/(.)photos/[id]/page.tsx) so they render the
// exact same photo data regardless of which one Next.js decides to render.
export const photos = [
  { id: "1", title: "Sunset", color: "#f97316" },
  { id: "2", title: "Ocean", color: "#0ea5e9" },
  { id: "3", title: "Forest", color: "#22c55e" },
];

export function getPhoto(id: string) {
  return photos.find((p) => p.id === id);
}
