"use client";

import React, { useState, useEffect, useCallback } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import MemoArea from "./MemoArea";
import MinutesProposal from "./MinutesProposal";
import { useAIMinutesGeneration } from "../hooks/useAIMinutesGeneration";
import { useLocalStorage } from "../hooks/useLocalStorage";
import styles from "./VoiceCanvas.module.css";

const VoiceCanvas: React.FC = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const [memos, setMemos] = useLocalStorage<string[]>("memos", []);
  const [currentMemo, setCurrentMemo] = useLocalStorage<string>(
    "currentMemo",
    ""
  );
  const { proposedMinutes, generateMinutes } = useAIMinutesGeneration();
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [isContinuousListening, setIsContinuousListening] = useState(false);

  useEffect(() => {
    setCurrentMemo((prevMemo) => prevMemo + " " + transcript);
  }, [transcript, setCurrentMemo]);

  useEffect(() => {
    if (memos.length > 0 || currentMemo.trim() !== "") {
      generateMinutes([...memos, currentMemo]);
    }
  }, [memos, currentMemo, generateMinutes]);

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveMemo = useCallback(() => {
    if (currentMemo.trim()) {
      setMemos((prevMemos) => [...prevMemos, currentMemo.trim()]);
      resetTranscript();
      setCurrentMemo("");
      showNotification("メモを保存しました", "success");
    }
  }, [currentMemo, resetTranscript, setMemos, setCurrentMemo]);

  const handleUpdateMemo = useCallback(
    (updatedMemo: string) => {
      setCurrentMemo(updatedMemo);
    },
    [setCurrentMemo]
  );

  const handleAcceptProposal = useCallback(() => {
    setMemos([proposedMinutes]);
    setCurrentMemo("");
    resetTranscript();
    showNotification("議事録を採用しました", "info");
  }, [proposedMinutes, resetTranscript, setMemos, setCurrentMemo]);

  const handleClearAll = useCallback(() => {
    setMemos([]);
    setCurrentMemo("");
    resetTranscript();
    showNotification("全てのデータをクリアしました", "warning");
  }, [setMemos, setCurrentMemo, resetTranscript]);

  const handleEditMemo = useCallback(
    (index: number, newContent: string) => {
      setMemos((prevMemos) => {
        const newMemos = [...prevMemos];
        newMemos[index] = newContent;
        return newMemos;
      });
      showNotification("メモを編集しました", "info");
    },
    [setMemos]
  );

  const handleDeleteMemo = useCallback(
    (index: number) => {
      setMemos((prevMemos) => prevMemos.filter((_, i) => i !== index));
      showNotification("メモを削除しました", "warning");
    },
    [setMemos]
  );

  useEffect(() => {
    if (isContinuousListening) {
      SpeechRecognition.startListening({ continuous: true, language: "ja-JP" });
    } else {
      SpeechRecognition.stopListening();
    }
  }, [isContinuousListening]);

  const toggleContinuousListening = () => {
    setIsContinuousListening(!isContinuousListening);
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>ブラウザが音声認識をサポートしていません。</span>;
  }

  return (
    <div className={styles.voiceCanvas}>
      <header className={styles.header}>
        <h1>AI Voice Canvas</h1>
        <div>
          <button
            onClick={toggleContinuousListening}
            className={`${styles.button} ${
              isContinuousListening ? styles.listening : ""
            }`}
          >
            {isContinuousListening ? "連続入力停止" : "連続入力開始"}
          </button>
          <button
            onClick={handleClearAll}
            className={`${styles.button} ${styles.warning}`}
          >
            全てクリア
          </button>
        </div>
      </header>
      <div className={styles.content}>
        <MemoArea
          currentMemo={currentMemo}
          memos={memos}
          onUpdateMemo={handleUpdateMemo}
          onSaveMemo={handleSaveMemo}
          onEditMemo={handleEditMemo}
          onDeleteMemo={handleDeleteMemo}
        />
        <MinutesProposal
          proposedMinutes={proposedMinutes}
          onAcceptProposal={handleAcceptProposal}
        />
      </div>
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default VoiceCanvas;
