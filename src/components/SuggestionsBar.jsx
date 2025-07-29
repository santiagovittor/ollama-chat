import React from "react";

export default function SuggestionsBar({
  suggestions,
  handleSuggestionClick,
  pal,
  lang,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 7,
        margin: "6px 0 0 4px",
      }}
    >
      <span
        style={{
          color: "#86a0b8",
          fontWeight: 600,
          fontSize: 13,
          marginRight: 6,
        }}
      >
        🤖 {lang === "es" ? "Sugerencias:" : "Suggestions:"}
      </span>
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          onClick={() => handleSuggestionClick(sug)}
          style={{
            background: pal.bubbleBot,
            color: pal.text,
            border: `1.2px solid ${pal.border}`,
            borderRadius: 9,
            padding: "3px 12px",
            fontSize: 13.3,
            cursor: "pointer",
            fontWeight: 600,
            transition: "background 0.18s",
          }}
        >
          {sug}
        </button>
      ))}
    </div>
  );
}
