import React, { useEffect } from "react";
import MessengerHeader from "./components/MessengerHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import SuggestionsBar from "./components/SuggestionsBar";
import { useChat } from "./hooks/useChat";
import './App.css'; // Global CSS

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
    langSwitch: "🇬🇧",
  },
  en: {
    welcome: "Hey, how can I help you today?",
    placeholder: "Type a message…",
    typing: "kikibot is typing…",
    send: "Send",
    nudge: "Nudge",
    langSwitch: "🇪🇸",
  },
};

function App() {
  const chat = useChat({
    defaultAvatar,
    botAvatar,
    t,
  });

  // Toggle body classes for light/dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", chat.dark);
    document.body.classList.toggle("light", !chat.dark);
  }, [chat.dark]);

  return (
    <div
      className={chat.dark ? "app-root dark" : "app-root light"}
      style={{
        height: "100dvh",
        width: "100dvw",
        margin: 0,
        padding: 0,
        fontFamily: "Segoe UI, Arial, sans-serif",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <div
        id="msn-card"
        className={chat.dark ? "dark" : "light"}
        style={{
          height: "100dvh",
          width: "100dvw",
          maxWidth: "100%",
          maxHeight: "100dvh",
          borderRadius: window.innerWidth > 600 ? 9 : 0,
          border: "none",
          boxShadow: "none",
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
          defaultAvatar={defaultAvatar}
          voiceEnabled={chat.voiceEnabled}
          setVoiceEnabled={chat.setVoiceEnabled}
          lang={chat.lang}
          setLang={chat.setLang}
          dark={chat.dark}
          setBgImage={chat.setBgImage}
          bgImage={chat.bgImage}
          setDark={chat.setDark}
          doNudge={chat.doNudge}
          t={chat.t}
          startNewChat={chat.startNewChat}
        />

        {/* Chat messages */}
        <ChatMessages
          messages={chat.messages}
          avatar={chat.avatar}
          botAvatar={chat.botAvatar}
          dark={chat.dark}
          t={chat.t}
          lang={chat.lang}
          loading={chat.loading}
          chatEnd={chat.chatEnd}
          isDefaultAvatar={chat.isDefaultAvatar}
          bgImage={chat.bgImage}
        />

        {/* Suggestions Bar */}
        {chat.suggestions.length > 0 && (
          <SuggestionsBar
            suggestions={chat.suggestions}
            handleSuggestionClick={chat.handleSuggestionClick}
            lang={chat.lang}
            dark={chat.dark}
          />
        )}

        {/* Chat Input */}
        <ChatInput
          input={chat.input}
          setInput={chat.setInput}
          sendMessage={chat.sendMessage}
          loading={chat.loading}
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
