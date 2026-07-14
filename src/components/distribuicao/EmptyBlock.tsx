import type { ReactNode } from "react";

export function EmptyBlock({
  icon,
  title,
  desc,
  children,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="d-empty">
      <div className="de-ico">{icon}</div>
      <div className="de-title">{title}</div>
      <div className="de-desc">{desc}</div>
      {children}
    </div>
  );
}
