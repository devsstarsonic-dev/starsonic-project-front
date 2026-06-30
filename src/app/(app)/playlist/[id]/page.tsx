import { notFound } from "next/navigation";
import { getPlaylistById } from "@/lib/data";
import { PlaylistDetail } from "@/components/playlist/PlaylistDetail";

export default async function PlaylistPage({ params }: { params: { id: string } }) {
  const playlist = await getPlaylistById(params.id);
  if (!playlist) notFound();

  return (
    <PlaylistDetail
      id={playlist.id}
      initialName={playlist.name}
      initialSongs={playlist.songs}
    />
  );
}
