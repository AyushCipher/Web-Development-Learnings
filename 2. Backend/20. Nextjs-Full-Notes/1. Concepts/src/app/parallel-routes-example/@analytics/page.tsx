// Fills the `analytics` slot prop in ../layout.tsx. This file's route
// segment is "@analytics", which is invisible in the URL - it still renders
// as part of /parallel-routes-example.
export default function Analytics() {
  return (
    <div>
      <h2 className="font-semibold">Analytics slot</h2>
      <p>Views: 1,204</p>
    </div>
  );
}
