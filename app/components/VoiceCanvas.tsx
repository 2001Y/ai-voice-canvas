"use client";

import "regenerator-runtime/runtime";
import React, { useState, useCallback, useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Toaster, toast } from "sonner";
import MemoArea from "./MemoArea";
import MinutesProposal from "./MinutesProposal";
import Settings from "./Settings";
import TranscriptArea from "./TranscriptArea";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAIMinutesGeneration } from "../hooks/useAIMinutesGeneration";

const VoiceCanvas: React.FC = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [apiKey, setApiKey] = useLocalStorage<string>("openai_api_key", "");

  // memoGenerationIntervalを削除
  const [minutesGenerationInterval, setMinutesGenerationInterval] =
    useLocalStorage<number>("minutes_generation_interval", 30);

  // メモをuseStateで管理
  const [memo, setMemo] = useState("");

  const { proposedMinutes, isGeneratingMinutes } = useAIMinutesGeneration(
    apiKey,
    minutesGenerationInterval,
    transcript,
    memo
  );

  const toggleListening = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: "ja-JP" });
    }
  }, [listening]);

  const handleAcceptProposal = useCallback(() => {
    setMemo("");
    resetTranscript();
    toast.info("議事録を採用しました");
  }, [resetTranscript, setMemo]);

  const handleClearAll = useCallback(() => {
    setMemo("");
    resetTranscript();
    toast.warning("全てのデータをクリアしました");
  }, [resetTranscript, setMemo]);

  // lodashを使用せずに、前回の保存時間を記録する方法で実装
  const lastMemoSaveTimeRef = useRef<number>(0);

  const saveMemoToLocalStorage = useCallback((memoToSave: string) => {
    const now = Date.now();
    if (now - lastMemoSaveTimeRef.current > 1000) {
      // 1秒（1000ミリ秒）以上経過しているかチェック
      localStorage.setItem("memo", memoToSave);
      lastMemoSaveTimeRef.current = now;
    }
  }, []);

  const handleMemoChange = useCallback(
    (newMemo: string) => {
      setMemo(newMemo);
      // 保存を1秒に1回に制限
      saveMemoToLocalStorage(newMemo);
    },
    [setMemo, saveMemoToLocalStorage]
  );

  useEffect(() => {
    localStorage.setItem("transcript", transcript);
  }, [transcript]);

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
            onBlur={() => saveMemoToLocalStorage(memo)}
          />
          <TranscriptArea transcript={transcript} />
        </div>
        <div className="right-column">
          <MinutesProposal
            proposedMinutes={proposedMinutes}
            onAcceptProposal={handleAcceptProposal}
            isGenerating={isGeneratingMinutes}
          />
        </div>
      </div>
      <Settings
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        minutesGenerationInterval={minutesGenerationInterval}
        onMinutesGenerationIntervalChange={setMinutesGenerationInterval}
      />
    </div>
  );
};

export default VoiceCanvas;
