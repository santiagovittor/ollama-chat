import React from "react";
import { Mic, MicOff, Send } from "lucide-react";


export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading,
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

  const voiceSupported = !!SpeechRecognition;

  return (
    <div
      className={`chat-input-bar ${dark ? "dark" : "light"}`}
    >
      <button
        className={`mic-btn ${listening ? "listening" : ""}`}
        onClick={startListening}
        disabled={listening}
        title={listening ? "Listening..." : "Click to speak"}
      >
        {listening ? (
          <MicOff size={18} strokeWidth={2} />
        ) : (
          <Mic size={18} strokeWidth={2} />
        )}
      </button>
      <input
        type="text"
        className="chat-input"
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
        className="send-btn"
        onClick={() => sendMessage()}
        disabled={loading || !input.trim()}
        title={t[lang].send}
      >
        <Send size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}
