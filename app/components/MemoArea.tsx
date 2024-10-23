"use client";

import React from "react";

interface MemoAreaProps {
  memo: string;
  onUpdateMemo: (memo: string) => void;
  onBlur: () => void;
}

const MemoArea: React.FC<MemoAreaProps> = ({ memo, onUpdateMemo, onBlur }) => {
  return (
    <div className="memo-area">
      <div className="memo-header">
        <h2>メモ</h2>
      </div>
      <textarea
        value={memo}
        onChange={(e) => onUpdateMemo(e.target.value)}
        onBlur={onBlur}
        placeholder="ここにメモが表示されます..."
        className="memo-input"
      />
    </div>
  );
};

export default MemoArea;
