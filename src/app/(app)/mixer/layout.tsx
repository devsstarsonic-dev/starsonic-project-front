import { ReactNode } from "react";
import "./mixer.css";

export default function MixerLayout({ children }: { children: ReactNode }) {
  return <section className="page">{children}</section>;
}
