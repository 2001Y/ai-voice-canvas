"use client";

import "regenerator-runtime/runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Toaster, toast } from "sonner"; // Sonnerをインポート
import MemoArea from "./MemoArea";
import MinutesProposal from "./MinutesProposal";
import Settings from "./Settings";
import TranscriptArea from "./TranscriptArea";
import { useLocalStorage } from "../hooks/useLocalStorage";

// OpenRouter APIのエンドポイントを定義
const OPENROUTER_API_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const VoiceCanvas: React.FC = () => {
  // showNotification関数をコンポーネントの先頭で定義
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" | "warning") => {
      toast[type](message);
    },
    []
  );

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [memo, setMemo] = useState("");
  const [apiKey, setApiKey] = useLocalStorage<string>("openai_api_key", "");
  const [proposedMinutes, setProposedMinutes] = useState("");
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [memoGenerationInterval, setMemoGenerationInterval] =
    useLocalStorage<number>("memo_generation_interval", 15000);
  const [minutesGenerationInterval, setMinutesGenerationInterval] =
    useLocalStorage<number>("minutes_generation_interval", 30000);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastProcessedTranscriptRef = useRef("");
  const lastProcessedMemoRef = useRef("");
  const [lastMemoGenerationTime, setLastMemoGenerationTime] = useState(
    Date.now()
  );
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);

  // トランスクリプトの最新値を保持するための useRef を追加
  const transcriptRef = useRef(transcript);

  // トランスクリプトが変更されたときに transcriptRef を更新
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const toggleListening = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: "ja-JP" });
    }
    setIsContinuousListening(!listening);
  }, [listening]);

  const generateMemoFromTranscript = useCallback(
    async (currentTranscript: string) => {
      // トランスクリプトが空でない場合にのみメモを生成
      if (currentTranscript.trim() === "" || !apiKey) {
        console.log(
          "トランスクリプトが空か、APIキーが設定されていないためスキップします"
        );
        return;
      }

      // 前回処理したトランスクリプトと同じ場合はスキップ
      if (currentTranscript === lastProcessedTranscriptRef.current) {
        console.log("前回処理したトランスクリプトと同じためスキップします");
        return;
      }

      console.log("新しいトランスクリプト:", currentTranscript); // デバッグ用ログ

      setLastMemoGenerationTime(Date.now());
      setIsGeneratingMemo(true);
      console.log("メモの生成を開始します");

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
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "あなたは提供された議事録に基づいて簡潔なメモを日本語で生成するAIアシスタントです。",
              },
              {
                role: "user",
                content: `以下の議事録に基づいて、簡潔なメモを日本語で作成してください：${currentTranscript}`,
              },
            ],
          }),
          signal: abortControllerRef.current.signal, // AbortSignalを追加
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter APIエラー: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const generatedMemo = data.choices[0].message.content;
        setMemo(generatedMemo);
        lastProcessedTranscriptRef.current = currentTranscript;
        showNotification("メモが自動生成されました", "success");
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("メモ生成がキャンセルされました");
        } else {
          console.error("メモ生成中にエラーが発生しました:", error);
          showNotification(
            `メモの生成中にエラーが発生しました: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            "error"
          );
        }
      } finally {
        abortControllerRef.current = null;
        setIsGeneratingMemo(false); // メモ生成終了時にフラグを下ろす
      }
    },
    [apiKey, showNotification]
  );

  // トランスクリプトが変更されたときの処理を調整
  useEffect(() => {
    console.log("メモ生成用のインターバルを設定します");
    const intervalId = setInterval(() => {
      console.log("定期的なメモ生成を実行します");
      generateMemoFromTranscript(transcriptRef.current); // 最新のトランスクリプトを使用
    }, memoGenerationInterval);

    return () => {
      console.log("インターバルをクリアします");
      clearInterval(intervalId);
    };
  }, [memoGenerationInterval, generateMemoFromTranscript]);

  // 以下は変更なし
  const generateMinutes = useCallback(
    async (memo: string) => {
      if (!memo.trim() || !apiKey || memo === lastProcessedMemoRef.current)
        return;

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
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content:
                  "あなたは提供されたメモに基づいて詳細な会議議事録を日本語で生成するAIアシスタントです。",
              },
              {
                role: "user",
                content: `以下のメモに基づいて、詳細な会議議事録を日本語で生成してください: ${memo}`,
              },
            ],
          }),
          signal: abortControllerRef.current.signal, // AbortSignalを追加
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter APIエラー: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const generatedMinutes = data.choices[0].message.content;
        setProposedMinutes(generatedMinutes);
        lastProcessedMemoRef.current = memo;
        showNotification("議���録が生成されました", "success");
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("議事録生成がキャンセルされました");
        } else {
          console.error("議事録生成中にエラーが発生しました:", error);
          showNotification("議事録の生成中にエラーが発生しました", "error");
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [apiKey]
  );

  const handleAcceptProposal = useCallback(() => {
    setMemo("");
    resetTranscript();
    lastProcessedTranscriptRef.current = "";
    lastProcessedMemoRef.current = "";
    showNotification("議事録を採用しました", "info");
  }, [resetTranscript, showNotification]);

  const handleClearAll = useCallback(() => {
    setMemo("");
    resetTranscript();
    lastProcessedTranscriptRef.current = "";
    lastProcessedMemoRef.current = "";
    showNotification("全てのデータをクリアしました", "warning");
  }, [resetTranscript, showNotification]);

  // メモの保存関数を追
  const saveMemo = useCallback(() => {
    if (memo.trim()) {
      localStorage.setItem("memo", memo);
      showNotification("メモを保存しました", "info");
    }
  }, [memo, showNotification]);

  // メモが変更されたときの処理
  const handleMemoChange = useCallback((newMemo: string) => {
    setMemo(newMemo);
    // メモが変更されるたびに保存
    localStorage.setItem("memo", newMemo);
  }, []);

  // memoの最新値を保持するための useRef を追加
  const memoRef = useRef(memo);

  // memoが変更されたときに memoRef を更新
  useEffect(() => {
    memoRef.current = memo;
  }, [memo]);

  // 議事録生成用のインターバルを設定
  useEffect(() => {
    console.log("議事録生成用のインターバルを設定します");
    const intervalId = setInterval(() => {
      console.log("定期的な議事録生成を実行します");
      generateMinutes(memoRef.current); // 最新のメモを使用
    }, minutesGenerationInterval);

    return () => {
      console.log("議事録生成のインターバルをクリアします");
      clearInterval(intervalId);
    };
  }, [minutesGenerationInterval, generateMinutes]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="error">ブラウザが音声認識をサポートしていません。</div>
    );
  }

  return (
    <div className="voice-canvas">
      <Toaster position="bottom-right" />
      <header className="header">
        <h1>AI Voice Canvas</h1>
        <div className="button-group">
          <button
            onClick={toggleListening}
            className={`button ${listening ? "primary" : "secondary"}`}
          >
            {listening ? "STOP" : "START"}
          </button>
          <button onClick={handleClearAll} className="button warning">
            全てクリア
          </button>
        </div>
      </header>
      <div className="content">
        <div className="left-column">
          <MemoArea
            memo={memo}
            onUpdateMemo={handleMemoChange}
            onBlur={saveMemo}
            isGenerating={isGeneratingMemo} // 新しいプロップを追加
          />
          <TranscriptArea transcript={transcript} />
        </div>
        <div className="right-column">
          <MinutesProposal
            proposedMinutes={proposedMinutes}
            onAcceptProposal={handleAcceptProposal}
          />
        </div>
      </div>
      <Settings
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        memoGenerationInterval={memoGenerationInterval}
        onMemoGenerationIntervalChange={setMemoGenerationInterval}
        minutesGenerationInterval={minutesGenerationInterval}
        onMinutesGenerationIntervalChange={setMinutesGenerationInterval}
      />
    </div>
  );
};

export default VoiceCanvas;
