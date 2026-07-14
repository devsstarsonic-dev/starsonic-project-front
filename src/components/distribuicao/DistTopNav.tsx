"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/distribuicao", label: "Visão geral" },
  { href: "/distribuicao/lancamentos", label: "Lançamentos" },
  { href: "/distribuicao/novo", label: "Novo" },
  { href: "/distribuicao/royalties", label: "Royalties" },
  { href: "/distribuicao/analytics", label: "Analytics" },
  { href: "/distribuicao/saldo", label: "Saldo & saques" },
  { href: "/distribuicao/kyc", label: "Pagamento & KYC" },
];

export function DistTopNav() {
  const pathname = usePathname();
  return (
    <nav className="dist-topnav">
      {LINKS.map((l) => {
        const active = l.href === "/distribuicao" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`dist-navpill${active ? " active" : ""}`}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
