import type { ReactNode } from "react";

interface UserCardProps {
  id: string;
  name?: string;
  subtitle?: ReactNode;
}

export function UserCard({ id, name, subtitle }: UserCardProps) {
  const displayName = name ?? "Guest";

  return (
    <div>
      <strong>#{id}</strong>
      <p>{displayName}</p>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
