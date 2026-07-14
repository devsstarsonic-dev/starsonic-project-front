import { NovoWizard } from "./NovoWizard";
import { getCreations, getDsps } from "@/lib/data";

const MUSIC_KINDS = new Set(["music", "instrumental", "jingle"]);

export default async function NovoLancamentoPage() {
  const [creations, dsps] = await Promise.all([getCreations(), getDsps()]);
  const musicas = creations.filter((c) => MUSIC_KINDS.has(c.kind));
  return <NovoWizard musicas={musicas} dsps={dsps} />;
}
