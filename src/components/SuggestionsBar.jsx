import React from "react";

export default function SuggestionsBar({
  suggestions,
  handleSuggestionClick,
  lang,
  dark,
}) {
  return (
    <div className={`suggestions-bar ${dark ? "dark" : "light"}`}>
      <span className="suggestions-label">
        🤖 {lang === "es" ? "Sugerencias:" : "Suggestions:"}
      </span>
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          className="suggestion-btn"
          onClick={() => handleSuggestionClick(sug)}
        >
          {sug}
        </button>
      ))}
    </div>
  );
}
