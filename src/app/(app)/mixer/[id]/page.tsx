import { notFound } from "next/navigation";
import { getCreations } from "@/lib/data";
import { MixerStudio } from "@/components/mixer/MixerStudio";

export default async function MixerStudioPage({ params }: { params: { id: string } }) {
  const creations = await getCreations();
  const c = creations.find((x) => x.id === params.id && x.audio_url);
  if (!c) notFound();

  return (
    <MixerStudio
      track={{
        id: c.id,
        title: c.title,
        genre: c.genre || "—",
        duration: c.duration || "—",
        emoji: c.emoji,
        from: c.gradient_from,
        to: c.gradient_to,
        audioUrl: c.audio_url,
      }}
    />
  );
}
