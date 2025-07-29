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
  // Detect iOS device
  function isIOS() {
    return (
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream
    );
  }

  // Detect SpeechRecognition support (exclude iOS)
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  const voiceSupported = !!SpeechRecognition && !isIOS();

  return (
    <div className={`chat-input-bar ${dark ? "dark" : "light"}`}>
      {/* Show mic button only if supported */}
      {voiceSupported && (
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
      )}
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
