import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  bgImage, // <-- NEW!
}) {
  const style = bgImage
    ? {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        /* Optionally add overlay for readability */
        position: "relative",
      }
    : undefined;

  return (
    <div
      className={`chat-messages ${dark ? "dark" : "light"}${bgImage ? " bg-img" : ""}`}
      style={style}
    >
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`chat-row ${msg.role === "user" ? "user" : "bot"}`}
        >
          {msg.role === "bot" && (
            <img
              src={botAvatar}
              alt="Bot"
              className="avatar avatar-bot"
            />
          )}
          <div className={`bubble bubble-${msg.role}`}>
            <ReactMarkdown
              children={msg.content}
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                strong: ({ node, ...props }) => <strong style={{ fontWeight: "bold" }} {...props} />,
                em: ({ node, ...props }) => <em style={{ fontStyle: "italic" }} {...props} />,
              }}
            />
          </div>
          {msg.role === "user" && (
            <img
              src={avatar}
              alt="Tú"
              className={`avatar avatar-user${isDefaultAvatar ? " default" : ""}`}
            />
          )}
        </div>
      ))}
      {loading && (
        <div className="chat-loading">
          <span className="typing-indicator">{t[lang].typing}</span>
          <div className="typing-dots">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="dot" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}
      <div ref={chatEnd} />
    </div>
  );
}
