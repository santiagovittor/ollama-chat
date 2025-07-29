import React, { useEffect } from "react";
import MessengerHeader from "./components/MessengerHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import SuggestionsBar from "./components/SuggestionsBar";
import { useChat } from "./hooks/useChat";

// Set these at the top-level
const defaultAvatar =
  "https://ui-avatars.com/api/?name=U&background=7EC0EE&color=fff&rounded=true";
const botAvatar =
  "https://ui-avatars.com/api/?name=K&background=757575&color=fff&rounded=true";

const t = {
  es: {
    welcome: "Hola, en que te puedo ayudar hoy?",
    placeholder: "Escribe un mensaje…",
    typing: "kikibot está pensando",
    send: "Enviar",
    nudge: "Zumbido",
    langSwitch: "🇬🇧", // ✅ Shows UK flag to switch to English
  },
  en: {
    welcome: "Hey, how can I help you today?",
    placeholder: "Type a message…",
    typing: "kikibot is typing…",
    send: "Send",
    nudge: "Nudge",
    langSwitch: "🇪🇸", // ✅ Shows Spain flag to switch to Spanish
  },
};

const baseUrl = process.env.REACT_APP_API_BASE_URL;

function App() {

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      label.avatar-upload:hover .avatar-pencil {
  opacity: 0.7;
}
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  // Use the custom hook for all state/logic
  const chat = useChat({
    defaultAvatar,
    botAvatar,
    t,
    baseUrl,
  });

  return (
    <div
      style={{
        height: "100dvh",
        width: "100dvw",
        margin: 0,
        padding: 0,
        background: chat.pal.bg,
        fontFamily: "Segoe UI, Arial, sans-serif",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <div
        id="msn-card"
        style={{
          height: "100dvh",
          width: "100dvw",
          maxWidth: "100%",
          maxHeight: "100dvh",
          borderRadius: window.innerWidth > 600 ? 9 : 0,
          border: "none",
          boxShadow: "none",
          background: chat.pal.card,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <MessengerHeader
          avatar={chat.avatar}
          setAvatar={chat.setAvatar}
          nickname={chat.nickname}
          setNickname={chat.setNickname}
          statusMsg={chat.statusMsg}
          setStatusMsg={chat.setStatusMsg}
          defaultAvatar={defaultAvatar}    // <--- ADD THIS LINE
          voiceEnabled={chat.voiceEnabled}
          setVoiceEnabled={chat.setVoiceEnabled}
          lang={chat.lang}
          setLang={chat.setLang}
          dark={chat.dark}
          setDark={chat.setDark}
          doNudge={chat.doNudge}
          t={chat.t}
          pal={chat.pal}
        />

        {/* Chat messages */}
        <ChatMessages
          messages={chat.messages}
          avatar={chat.avatar}
          botAvatar={chat.botAvatar}
          pal={chat.pal}
          dark={chat.dark}
          t={chat.t}
          lang={chat.lang}
          loading={chat.loading}
          chatEnd={chat.chatEnd}
          isDefaultAvatar={chat.isDefaultAvatar}
        />

        {/* Suggestions Bar */}
        {chat.suggestions.length > 0 && (
          <SuggestionsBar
            suggestions={chat.suggestions}
            handleSuggestionClick={chat.handleSuggestionClick}
            pal={chat.pal}
            lang={chat.lang}
          />
        )}

        {/* Chat Input */}
        <ChatInput
          input={chat.input}
          setInput={chat.setInput}
          sendMessage={chat.sendMessage}
          loading={chat.loading}
          pal={chat.pal}
          dark={chat.dark}
          t={chat.t}
          lang={chat.lang}
          listening={chat.listening}
          startListening={chat.startListening}
        />
      </div>
    </div>
  );
}

export default App;
