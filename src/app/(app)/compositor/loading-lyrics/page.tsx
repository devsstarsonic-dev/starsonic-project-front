"use client";

import { LoadingLyrics } from "@/components/Compositor/LoadingLyrics";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingLyricsPage() {
  const router = useRouter();
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/compositor/loading-music");
  };

  return (
    <LoadingLyrics
      onContinue={showContinue ? handleContinue : undefined}
    />
  );
}
