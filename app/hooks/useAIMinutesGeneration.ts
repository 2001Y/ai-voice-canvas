"use client";

import { useState, useCallback } from "react";

// OpenAI APIの代わりにダミー関数を使用
const generateDummyMinutes = (memos: string[]): string => {
  const date = new Date().toLocaleDateString("ja-JP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const participants = ["山田太郎", "佐藤花子", "鈴木一郎"];
  const topics = ["プロジェクトの進捗報告", "次期計画の策定", "予算の見直し"];

  return `
日付: ${date}
参加者: ${participants.join(", ")}

議題:
${topics.map((topic, index) => `${index + 1}. ${topic}`).join("\n")}

議事内容:
${memos.map((memo, index) => `${index + 1}. ${memo}`).join("\n")}

決定事項:
- プロジェクトAの期限を1週間延長する
- 次回のミーティングで予算案を再検討する

次回のアクションアイテム:
- 各部署の進捗レポートを作成する
- 新規プロジェクトの企画書を準備する
  `;
};

export const useAIMinutesGeneration = () => {
  const [proposedMinutes, setProposedMinutes] = useState("");

  const generateMinutes = useCallback((memos: string[]) => {
    if (memos.length === 0) {
      setProposedMinutes("");
      return;
    }

    // 実際のAPIコールの代わりにダミー関数を使用
    const generatedMinutes = generateDummyMinutes(memos);
    setProposedMinutes(generatedMinutes);
  }, []);

  return { proposedMinutes, generateMinutes };
};
