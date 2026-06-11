"use client";

import { LoadingMusic } from "@/components/Compositor/LoadingMusic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoadingMusicPage() {
  const router = useRouter();
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    router.push("/compositor/resultado");
  };

  return (
    <LoadingMusic
      onContinue={showContinue ? handleContinue : undefined}
    />
  );
}
