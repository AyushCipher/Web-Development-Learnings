import type { PropsWithChildren, ReactNode } from "react";

type PanelProps = {
  title: string;
  children?: ReactNode;   // ReactNode = a TYPE that represents anything React can render
};

export function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h1>{title}</h1>
      <div>{children ?? <em>No Children present</em>}</div>
    </section>
  );
}

interface RequiredChildrenProps extends PropsWithChildren {
  title: string;
  children: ReactNode;
}

export function RequiredChildrenPanel({
  title,
  children,
}: RequiredChildrenProps) {
  return (
    <section>
      <h1>{title}</h1>
      <div>{children}</div>
    </section>
  );
}
