"use client";

import React, { useState } from "react";
import styles from "./MemoArea.module.css";

interface MemoAreaProps {
  currentMemo: string;
  memos: string[];
  onUpdateMemo: (memo: string) => void;
  onSaveMemo: () => void;
  onEditMemo: (index: number, newContent: string) => void;
  onDeleteMemo: (index: number) => void;
}

const MemoArea: React.FC<MemoAreaProps> = ({
  currentMemo,
  memos,
  onUpdateMemo,
  onSaveMemo,
  onEditMemo,
  onDeleteMemo,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const handleEditStart = (index: number, content: string) => {
    setEditingIndex(index);
    setEditingContent(content);
  };

  const handleEditSave = () => {
    if (editingIndex !== null) {
      onEditMemo(editingIndex, editingContent);
      setEditingIndex(null);
    }
  };

  return (
    <div className={styles.memoArea}>
      <h2>メモエリア</h2>
      <textarea
        value={currentMemo}
        onChange={(e) => onUpdateMemo(e.target.value)}
        placeholder="ここにメモを入力..."
        className={styles.memoInput}
      />
      <button onClick={onSaveMemo} className={styles.button}>
        メモを保存
      </button>
      <div className={styles.memoList}>
        {memos.map((memo, index) => (
          <div key={index} className={styles.memoItem}>
            {editingIndex === index ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className={styles.editInput}
                />
                <button onClick={handleEditSave} className={styles.editButton}>
                  保存
                </button>
              </>
            ) : (
              <>
                {memo}
                <button
                  onClick={() => handleEditStart(index, memo)}
                  className={styles.editButton}
                >
                  編集
                </button>
                <button
                  onClick={() => onDeleteMemo(index)}
                  className={styles.deleteButton}
                >
                  削除
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoArea;
