import React from "react";
import styles from "./SuggestionsBar.module.scss";


export default function SuggestionsBar({
  suggestions,
  handleSuggestionClick,
  lang,
  dark,
}) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={`${styles.suggestionsBar} ${dark ? "dark" : "light"}`}>
      <span className={styles.suggestionsLabel}>
        🤖 {lang === "es" ? "Sugerencias:" : "Suggestions:"}
      </span>
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          className={styles.suggestionBtn}
          onClick={() => handleSuggestionClick(sug)}
        >
          {sug}
        </button>
      ))}
    </div>
  );
}
