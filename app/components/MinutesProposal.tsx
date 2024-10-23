"use client";

import React from "react";

interface MinutesProposalProps {
  proposedMinutes: string;
  onAcceptProposal: () => void;
  isGenerating: boolean; // isGeneratingプロップを追加
}

const MinutesProposal: React.FC<MinutesProposalProps> = ({
  proposedMinutes,
  onAcceptProposal,
  isGenerating, // isGeneratingを受け取る
}) => {
  return (
    <div className="minutes-proposal">
      <h2>議事録提案</h2>
      {isGenerating && <span className="generating-indicator">生成中...</span>}
      <div className="proposal-content">{proposedMinutes}</div>
    </div>
  );
};

export default MinutesProposal;
