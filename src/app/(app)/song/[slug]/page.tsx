import { notFound } from "next/navigation";
import { getAllCreations, getPlaylists, getProfile } from "@/lib/data";
import { slugify } from "@/lib/format";
import { SongView } from "@/components/SongView";

export default async function SongPage({ params }: { params: { slug: string } }) {
  const [songs, playlists, profile] = await Promise.all([
    getAllCreations(),
    getPlaylists(),
    getProfile(),
  ]);
  const song = songs.find((s) => slugify(s.title) === params.slug);
  if (!song) notFound();

  const playlistOpts = playlists.map((p) => ({ id: p.id, name: p.name, creationsId: p.creationsId }));

  return (
    <SongView
      song={song}
      author={song.profiles?.full_name || "Artista"}
      playlists={playlistOpts}
      profileId={profile?.id ?? null}
    />
  );
}
