import React from "react";

export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
  pal,
  dark,
  t,
  lang,
  listening,
  startListening,
}) {
  // Detect SpeechRecognition support
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  // Button is disabled if voice not supported
  const voiceSupported = !!SpeechRecognition;

  return (
    <div
      style={{
        flex: "0 0 auto",
        borderTop: `1.5px solid ${pal.border}`,
        background: pal.input,
        padding: "10px 10px 10px 13px",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <button
        onClick={startListening}
        disabled={!voiceSupported}
        style={{
          background: listening ? "#ffeb3b" : pal.bubbleBot,
          color: pal.text,
          border: `1px solid ${pal.border}`,
          borderRadius: 13,
          fontSize: 16,
          padding: "6px 12px",
          cursor: !voiceSupported ? "not-allowed" : "pointer",
          boxShadow: listening ? "0 0 10px #ffeb3b99" : "none",
          animation: listening ? "pulse 1s infinite" : "none",
          opacity: !voiceSupported ? 0.6 : 1,
          transition: "opacity 0.2s",
        }}
        title={
          !voiceSupported
            ? "🎤 Voice input is not supported on this device/browser."
            : listening
            ? "Listening…"
            : lang === "es"
            ? "Hablar"
            : "Speak"
        }
      >
        {listening ? "🎧" : "🎤"}
      </button>
      <input
        type="text"
        style={{
          flex: 1,
          border: `1.3px solid ${pal.border}`,
          borderRadius: 16,
          padding: "8px 13px",
          fontSize: 15,
          outline: "none",
          background: pal.input,
          color: pal.text,
          fontFamily: "inherit",
          boxShadow: dark
            ? "0 2px 4px #1a1d27aa inset"
            : "0 2px 4px #dbe9f6aa inset",
        }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        placeholder={t[lang].placeholder}
        disabled={loading}
        autoFocus
      />
      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        style={{
          background: pal.bubbleUser,
          color: "#fff",
          fontWeight: 700,
          border: "none",
          borderRadius: 13,
          fontSize: 15,
          padding: "7px 16px 7px 14px",
          cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          boxShadow: "0 1px 4px #84b8eb33",
        }}
        title={t[lang].send}
      >
        {t[lang].send}
      </button>
    </div>
  );
}
