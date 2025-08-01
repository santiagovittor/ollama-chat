import React from "react";
import { Mic, MicOff, Send } from "lucide-react";
import styles from "./ChatInput.module.scss";

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

  // Handler to clear input and send
  const [isFading, setIsFading] = React.useState(false);

  const handleSend = () => {
    if (loading || !input.trim()) return;
    setIsFading(true);          // trigger fade
    setTimeout(() => {
      setIsFading(false);       // reset after fade duration
      setInput("");             // clear after fade
      sendMessage();
    }, 300);                    // 180ms is quick but visible
  };

  return (
    <div
      className={`${styles.chatInputBar} ${dark ? styles.dark : styles.light}`}
    >
      {/* Show mic button only if supported */}
      {voiceSupported && (
        <button
          type="button"
          className={`${styles.micBtn} ${listening ? styles.listening : ""}`}
          onClick={startListening}
          disabled={listening || loading}
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
        className={`${styles.chatInput} ${isFading ? styles.chatInputFading : ""}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();   // <-- use ONLY handleSend
          }
        }}
        placeholder={t[lang].placeholder}
        disabled={loading}
        autoFocus
      />
      <button
        type="button"
        className={styles.sendBtn}
        onClick={handleSend}   // <-- use ONLY handleSend
        disabled={loading || !input.trim()}
        title={t[lang].send}
      >
        <Send size={18} strokeWidth={2.2} />
      </button>
    </div>
  );
}
