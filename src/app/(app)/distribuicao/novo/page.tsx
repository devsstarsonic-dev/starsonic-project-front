import { NovoWizard } from "./NovoWizard";
import { getCreations, getDsps } from "@/lib/data";

export default async function NovoLancamentoPage() {
  const [creations, dsps] = await Promise.all([getCreations(), getDsps()]);
  const musicas = creations.filter((c) => c.kind === "music");
  return <NovoWizard musicas={musicas} dsps={dsps} />;
}
