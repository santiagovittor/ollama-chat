import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatMessages({
  messages,
  avatar,
  botAvatar,
  pal,
  dark,
  t,
  lang,
  loading,
  chatEnd,
  isDefaultAvatar,
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        background: dark ? "#22242a" : "#eaf3fb",
        padding: 11,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 12,
            gap: 8,
          }}
        >
          {msg.role === "bot" && (
            <img
              src={botAvatar}
              alt="Bot"
              style={{
                width: 25,
                height: 25,
                borderRadius: 14,
                border: `1px solid ${pal.border}`,
                objectFit: "cover",
              }}
            />
          )}
          <div
            style={{
              background: msg.role === "user" ? pal.bubbleUser : pal.bubbleBot,
              color: msg.role === "user" ? "#fff" : pal.text,
              borderRadius:
                msg.role === "user"
                  ? "18px 16px 6px 18px"
                  : "16px 18px 18px 6px",
              padding: "8px 13px",
              fontSize: 15,
              maxWidth: "74vw",
              minHeight: 22,
              wordBreak: "break-word",
              boxShadow:
                msg.role === "user"
                  ? "0 2px 14px #96d8ff25"
                  : "0 1px 8px #dae7f825",
              border: `1px solid ${pal.border}`,
            }}
          >
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
              }}
            />
          </div>
          {msg.role === "user" && (
            <img
              src={avatar}
              alt="Tú"
              style={{
                width: 25,
                height: 25,
                borderRadius: 14,
                border: isDefaultAvatar
                  ? `1px solid ${pal.border}`
                  : "1px solid transparent",
                objectFit: "cover",
                background: isDefaultAvatar ? "none" : "#c7e5f9",
              }}
            />
          )}
        </div>
      ))}
      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            margin: "6px 0 4px 32px",
          }}
        >
          <span
            style={{
              fontStyle: "italic",
              fontSize: 14,
              color: dark ? "#aad3ff" : "#4c5d81",
            }}
          >
            {t[lang].typing}
          </span>
          <div style={{ display: "flex", gap: 3 }}>
            {[...Array(3)].map((_, i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  background: dark ? "#aad3ff" : "#4c5d81",
                  borderRadius: "50%",
                  animation: `blink 1.2s ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      <div ref={chatEnd} />
    </div>
  );
}
