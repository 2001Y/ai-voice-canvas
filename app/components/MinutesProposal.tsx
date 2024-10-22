'use client';

import React from "react";
import styles from "./MinutesProposal.module.css";

interface MinutesProposalProps {
  proposedMinutes: string;
  onAcceptProposal: () => void;
}

const MinutesProposal: React.FC<MinutesProposalProps> = ({
  proposedMinutes,
  onAcceptProposal,
}) => {
  return (
    <div className={styles.minutesProposal}>
      <h2>議事録提案</h2>
      <div className={styles.proposalContent}>
        <pre>{proposedMinutes}</pre>
      </div>
      <button onClick={onAcceptProposal} className={styles.button}>
        この提案を採用
      </button>
    </div>
  );
};

export default MinutesProposal;
