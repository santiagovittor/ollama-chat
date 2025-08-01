import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./ChatMessages.module.scss";

export default function ChatMessages({
  messages,
  avatar,
  botAvatar,
  dark,
  t,
  lang,
  loading,
  chatEnd,
  isDefaultAvatar,
  bgImage,
}) {
  // Auto-scroll on new messages (except initial render)
  useEffect(() => {
    if (chatEnd?.current) {
      chatEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, chatEnd]);

  const style = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }
    : undefined;

  // Optional: semi-transparent overlay for background images
  const overlay = bgImage ? (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: dark
          ? "rgba(24,28,36,0.60)"
          : "rgba(250, 250, 250, 0.35)",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  ) : null;

  // Show typing indicator only if last message is from user (during streaming)
  const shouldShowTyping =
    loading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user";

  // Helper: render JSON tool calls pretty
  function renderIfJSON(content) {
    try {
      if (
        typeof content === "string" &&
        content.trim().startsWith("{") &&
        content.trim().endsWith("}")
      ) {
        const parsed = JSON.parse(content);
        if (parsed.tool_call) {
          return (
            <pre className={styles.toolJsonBlock}>
              {JSON.stringify(parsed, null, 2)}
            </pre>
          );
        }
      }
    } catch {
      // Not JSON, ignore
    }
    return null;
  }

  return (
    <div
      className={`${styles.chatMessages} ${dark ? styles.dark : styles.light} ${
        bgImage ? styles.bgImg : ""
      }`}
      style={style}
    >
      {overlay}
      <div style={{ position: "relative", zIndex: 1 }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.chatRow} ${
              msg.role === "user" ? styles.user : styles.bot
            }`}
            aria-live="polite"
          >
            {msg.role === "bot" && (
              <img
                src={botAvatar}
                alt={lang === "es" ? "Bot" : "Bot"}
                className={`${styles.avatar} ${styles.avatarBot}`}
                aria-label={lang === "es" ? "Avatar del bot" : "Bot avatar"}
              />
            )}
            <div
              className={`${styles.bubble} ${
                msg.role === "user" ? styles.bubbleUser : styles.bubbleBot
              }`}
            >
              {/* Tool call JSON? Show pretty, else markdown */}
              {renderIfJSON(msg.content) || (
                <ReactMarkdown
                  children={msg.content}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p style={{ margin: 0 }} {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong style={{ fontWeight: "bold" }} {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em style={{ fontStyle: "italic" }} {...props} />
                    ),
                    code: ({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }) =>
                      inline ? (
                        <code
                          style={{
                            background: dark ? "#2e3241" : "#e9e9e9",
                            borderRadius: 4,
                            padding: "1px 4px",
                            fontSize: "90%",
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre
                          style={{
                            background: dark ? "#23272e" : "#f4f6f8",
                            borderRadius: 8,
                            padding: "12px 10px",
                            overflowX: "auto",
                            fontSize: "0.97em",
                          }}
                          {...props}
                        >
                          <code>{children}</code>
                        </pre>
                      ),
                  }}
                />
              )}
            </div>
            {msg.role === "user" && (
              <img
                src={avatar}
                alt={lang === "es" ? "Tú" : "You"}
                className={`${styles.avatar} ${styles.avatarUser}${
                  isDefaultAvatar ? " " + styles.default : ""
                }`}
                aria-label={lang === "es" ? "Tu avatar" : "Your avatar"}
              />
            )}
          </div>
        ))}

        {shouldShowTyping && (
          <div className={styles.chatLoading}>
            <span className={styles.typingIndicator}>{t[lang].typing}</span>
            <div className={styles.typingDots} aria-label="Typing dots">
              {[...Array(3)].map((_, i) => (
                <span
                  key={i}
                  className={styles.dot}
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={chatEnd} />
      </div>
    </div>
  );
}
