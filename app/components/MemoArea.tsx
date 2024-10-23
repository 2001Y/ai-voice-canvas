"use client";

import React from "react";

interface MemoAreaProps {
  memo: string;
  onUpdateMemo: (memo: string) => void;
  onBlur: () => void;
  isGenerating: boolean; // 新しいプロップを追加
}

const MemoArea: React.FC<MemoAreaProps> = ({
  memo,
  onUpdateMemo,
  onBlur,
  isGenerating,
}) => {
  return (
    <div className="memo-area">
      <div className="memo-header">
        <h2>メモ</h2>
        {isGenerating && (
          <span className="generating-indicator">生成中...</span>
        )}
      </div>
      <p>メモしましょう。音声認識を元に定期的にAIがメモを清書してくれます。</p>
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
