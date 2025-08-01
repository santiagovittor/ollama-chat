import  { useEffect } from "react";
import MessengerHeader from "./components/MessengerHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import MsnCard from "./components/MsnCard";
import { useChat } from "./hooks/useChat";
import styles from "./App.module.scss";
import "./styles/global.scss";

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

  // Toggle dark/light class on body (optional global theming)
  useEffect(() => {
    document.body.classList.toggle("dark", chat.dark);
    document.body.classList.toggle("light", !chat.dark);
  }, [chat.dark]);

  return (
    <div className={styles.appRoot + (chat.dark ? " dark" : " light")}>
      <MsnCard dark={chat.dark} isNudging={chat.isNudging}>
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
          doNudge={chat.doNudge}         // <-- This triggers the nudge
          t={chat.t}
          startNewChat={chat.startNewChat}
        />

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
      </MsnCard>
    </div>
  );
}

export default App;
