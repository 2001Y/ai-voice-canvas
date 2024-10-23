"use client";

import { useState, useCallback } from "react";

const generateMinutesWithAPI = async (
  memo: string,
  apiKey: string
): Promise<string> => {
  const response = await fetch("/api/generate-minutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ memo, apiKey }),
  });

  const data = await response.json();
  if (response.ok) {
    return data.minutes;
  } else {
    throw new Error(data.error || "Failed to generate minutes");
  }
};

export const useAIMinutesGeneration = (apiKey: string) => {
  const [proposedMinutes, setProposedMinutes] = useState("");

  const generateMinutes = useCallback(
    async (memo: string) => {
      console.log("議事録の生成を試みています..."); // 日本語に変更
      if (memo.trim() === "" || !apiKey) {
        console.log("メモが空か、APIキーが欠落しています。"); // 日本語に変更
        setProposedMinutes("");
        return;
      }

      try {
        console.log("議事録生成のリクエストを送信中..."); // 日本語に変更
        const generatedMinutes = await generateMinutesWithAPI(memo, apiKey);
        console.log("議事録が正常に生成されました:", generatedMinutes); // 日本語に変更
        setProposedMinutes(generatedMinutes);
      } catch (error) {
        console.error("議事録の生成中にエラーが発生しました:", error); // 日本語に変更
        setProposedMinutes("議事録の生成中にエラーが発生しました。");
      }
    },
    [apiKey]
  );

  return { proposedMinutes, generateMinutes };
};
