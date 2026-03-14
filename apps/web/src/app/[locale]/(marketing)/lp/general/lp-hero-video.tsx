"use client";

import { useEffect, useRef } from "react";

type LpHeroVideoProps = {
  src: string;
  className?: string;
};

export function LpHeroVideo({ src, className }: LpHeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const applyRate = () => {
      video.playbackRate = 1.25;
    };
    applyRate();
    video.addEventListener("loadedmetadata", applyRate);
    video.addEventListener("play", applyRate);
    return () => {
      video.removeEventListener("loadedmetadata", applyRate);
      video.removeEventListener("play", applyRate);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
    />
  );
}
