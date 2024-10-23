"use client";

import React from "react";

interface SettingsProps {
  apiKey: string;
  onApiKeyChange: (newKey: string) => void;
  minutesGenerationInterval: number;
  onMinutesGenerationIntervalChange: (newInterval: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  apiKey,
  onApiKeyChange,
  minutesGenerationInterval,
  onMinutesGenerationIntervalChange,
}) => {
  return (
    <div className="settings">
      <h3>設定</h3>
      <label>
        OpenAI APIキー:
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="sk-..."
        />
      </label>
      <div>
        <label>
          議事録をAI生成する間隔（ミリ秒）:
          <input
            type="number"
            value={minutesGenerationInterval}
            onChange={(e) =>
              onMinutesGenerationIntervalChange(Number(e.target.value))
            }
          />
        </label>
      </div>
    </div>
  );
};

export default Settings;
