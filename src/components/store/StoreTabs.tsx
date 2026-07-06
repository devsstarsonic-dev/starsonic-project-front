"use client";

import { useState } from "react";

export type StoreTab = { key: string; label: string };

export function StoreTabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: StoreTab[];
  activeTab?: string;
  onTabChange?: (tabKey: string) => void;
}) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.key ?? "");
  const active = activeTab ?? internalActive;

  const handleTabChange = (key: string) => {
    if (!activeTab) setInternalActive(key);
    onTabChange?.(key);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottom: "1px solid var(--border-soft)",
        flexWrap: "wrap",
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => handleTabChange(tab.key)}
          style={{
            color: active === tab.key ? "var(--cyan-1)" : "var(--text-3)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: active === tab.key ? 600 : 400,
            position: "relative",
            padding: 0,
            transition: "color 0.2s",
          }}
        >
          {tab.label}
          {active === tab.key && (
            <span
              style={{
                position: "absolute",
                bottom: -14,
                left: 0,
                right: 0,
                height: 2,
                background: "linear-gradient(90deg, var(--cyan-1), var(--purple))",
                borderRadius: 1,
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
