import React from "react";

interface TranscriptAreaProps {
  transcript: string;
}

const TranscriptArea: React.FC<TranscriptAreaProps> = ({ transcript }) => {
  return (
    <div className="transcript-area">
      <h2>音声認識結果</h2>
      <div className="transcript-content">
        {transcript || "音声を認識するとここに表示されます..."}
      </div>
    </div>
  );
};

export default TranscriptArea;
