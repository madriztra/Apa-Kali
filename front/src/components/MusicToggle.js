import React, { useRef, useState } from "react";

export default function MusicToggle() {
  const audioRef = useRef(new Audio("/music/main.mp3"));
  
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/music/main.mp3");
      audioRef.current.loop = true;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((e) => {
        console.log("Audio gagal diputar:", e);
      });
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <button onClick={handleToggleMusic}>
      {isPlaying ? "🔇 Matikan Musik" : "🔊 Nyalakan Musik"}
    </button>
  );
}
