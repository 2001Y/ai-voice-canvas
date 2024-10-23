import React from "react";
import dynamic from "next/dynamic";

const VoiceCanvas = dynamic(() => import("./components/VoiceCanvas"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="app-container">
      <VoiceCanvas />
    </div>
  );
}
