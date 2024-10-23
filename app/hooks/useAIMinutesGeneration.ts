"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// 前回のトランスクリプトからの最小増加文字数を設定（1文字）
const MIN_TRANSCRIPT_LENGTH_INCREMENT = 1;

export const useAIMinutesGeneration = (
  apiKey: string,
  minutesGenerationInterval: number,
  transcript: string,
  memo: string
) => {
  const [proposedMinutes, setProposedMinutes] = useState("");
  const [isGeneratingMinutes, setIsGeneratingMinutes] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // lastGenerationTimeをuseRefで管理
  const lastGenerationTimeRef = useRef(0);

  // 議事録生成中かどうかを確認
  const isGeneratingRef = useRef(false);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning") => {
      toast[type](message);
    },
    []
  );

  const generateMinutes = useCallback(
    async (inputTranscript: string, inputMemo: string) => {
      if (!apiKey || !inputTranscript) {
        console.log(
          "APIキーが設定されていないか、トランスクリプトが空のため、議事録生成をスキップします"
        );
        return;
      }

      const now = Date.now();

      // 議事録生成中であればスキップ
      if (isGeneratingRef.current) {
        console.log("議事録生成中のため、スキップします");
        return;
      }

      // 前回の生成から指定された間隔が経過していなければスキップ
      if (
        now - lastGenerationTimeRef.current <
        minutesGenerationInterval * 1000
      ) {
        console.log(
          "前回の生成からの間隔が短いため、議事録生成をスキップします"
        );
        return;
      }

      console.log("新しいトランスクリプトで議事録を生成します");
      isGeneratingRef.current = true;
      setIsGeneratingMinutes(true);
      lastGenerationTimeRef.current = now;

      // 進行中の生成をキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 新しいAbortControllerを作成
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(OPENROUTER_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `あなたは会議の音声文字起こしとユーザーのメモから詳細な会議議事録を生成するAI APIです。以下の指示に厳密に従ってください：
1. 音声認識結果およびユーザーのメモに含まれている情報のみを使用し、推測や追加情報を絶対に含めないでください。
2. 重要なポイント、決定事項、アクションアイテムを詳細に記載してください。
3. 議論の流れを再構成し、トピックごとに整理してください。
4. 出力はMarkdown構文は使わないでください。タイトルには■などの記号を使って表現した上で、文章よりは箇条書きでレイアウトしてください。
5. 音声認識結果とユーザーのメモを統合し、重複を避けて包括的な議事録を生成してください。
6. 音声認識結果やメモにあるが、会議との関連性が不明確な内容は、議事録の最後に「その他の言及」としてリストアップしてください。
7. 出力は日本語で行ってください。`,
              },
              {
                role: "user",
                content: `以下の会議の音声文字起こしとユーザーのメモに基づいて、上記の指示に従った詳細な会議議事録を生成してください。

■ ユーザーのメモ：
${inputMemo}

■ 音声文字起こし：
${inputTranscript}`,
              },
            ],
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter APIエラー: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const generatedMinutes = data.choices[0].message.content;
        setProposedMinutes(generatedMinutes);

        showNotification("議事録が生成されました", "success");
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("議事録生成がキャンセルされました");
        } else {
          console.error("議事録生成中にエラーが発生しました:", error);
          showNotification(
            `議事録の生成中にエラーが発生しました: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            "error"
          );
        }
      } finally {
        abortControllerRef.current = null;
        setIsGeneratingMinutes(false);
        isGeneratingRef.current = false;
      }
    },
    [apiKey, minutesGenerationInterval, showNotification]
  );

  // transcriptの変更を監視し、議事録生成を呼び出す
  useEffect(() => {
    generateMinutes(transcript, memo);
  }, [transcript, memo, generateMinutes]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("proposedMinutes", proposedMinutes);
  }, [proposedMinutes]);

  return { proposedMinutes, setProposedMinutes, isGeneratingMinutes };
};
