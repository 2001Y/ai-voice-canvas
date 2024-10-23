"use client";

import React from "react";

interface MinutesProposalProps {
  proposedMinutes: string;
}

const MinutesProposal: React.FC<MinutesProposalProps> = ({
  proposedMinutes,
}) => {
  return (
    <div className="minutes-proposal">
      <h2>議事録提案</h2>
      <div className="proposal-content">{proposedMinutes}</div>
    </div>
  );
};

export default MinutesProposal;
