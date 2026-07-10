import { ReactNode } from "react";
import { VocalistaProvider } from "@/lib/vocalista/VocalistaContext";
import "./vocalista.css";

export default function VocalistaLayout({ children }: { children: ReactNode }) {
  return <VocalistaProvider>{children}</VocalistaProvider>;
}
