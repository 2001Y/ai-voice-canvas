"use client";

import React from "react";

interface SettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  memoGenerationInterval: number;
  onMemoGenerationIntervalChange: (interval: number) => void;
  minutesGenerationInterval: number;
  onMinutesGenerationIntervalChange: (interval: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  apiKey,
  onApiKeyChange,
  memoGenerationInterval,
  onMemoGenerationIntervalChange,
  minutesGenerationInterval,
  onMinutesGenerationIntervalChange,
}) => {
  return (
    <div className="settings">
      <h3>設定</h3>
      <label>
        メモをAI生成する間隔（秒）:
        <input
          type="number"
          value={memoGenerationInterval / 1000}
          onChange={(e) =>
            onMemoGenerationIntervalChange(Number(e.target.value) * 1000)
          }
          min="5"
          max="60"
        />
      </label>
      <label>
        議事録をAI生成する間隔（秒）:
        <input
          type="number"
          value={minutesGenerationInterval / 1000}
          onChange={(e) =>
            onMinutesGenerationIntervalChange(Number(e.target.value) * 1000)
          }
          min="10"
          max="300"
        />
      </label>
      <label>
        OpenAI APIキー:
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
        />
      </label>
    </div>
  );
};

export default Settings;
