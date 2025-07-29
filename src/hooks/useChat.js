import { useState, useRef, useEffect } from "react";

// ====== NEW: Session ID generator (persistent) ======
function getSessionId() {
  let sessionId = localStorage.getItem("gemmaSessionId");
  console.log("Gemma sessionId:", sessionId);
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("gemmaSessionId", sessionId);
  }
  return sessionId;
}
// ====================================================



function getPalette(dark) {
  return dark
    ? {
      bg: "#23272e",
      card: "#23272e",
      bubbleUser: "#447ace",
      bubbleBot: "#2e3241",
      text: "#e8f0fa",
      border: "#304057",
      header: "linear-gradient(90deg, #333b48 0%, #4a5670 100%)",
      input: "#1e2228",
      placeholder: "#97aac5",
    }
    : {
      bg: "#dbe9f6",
      card: "#fafdff",
      bubbleUser: "#39a2ff",
      bubbleBot: "#f0f4fb",
      text: "#222f3b",
      border: "#90bae6",
      header: "linear-gradient(90deg, #5ebcfb 0%, #a1d1f9 100%)",
      input: "#fff",
      placeholder: "#8fa8c6",
    };
}

export function useChat({
  defaultAvatar,
  botAvatar,
  t,
  baseUrl,
}) {
  // State
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "👋 ¡Bienvenido! Chatea como en el viejo Windows Live Messenger.",
    },
  ]);
  const [nickname, setNickname] = useState(
    () => localStorage.getItem("nickname") || "Tú"
  );
  const [statusMsg, setStatusMsg] = useState(
    () => localStorage.getItem("statusMsg") || ""
  );
  const [avatar, setAvatar] = useState(
    () => localStorage.getItem("avatar") || defaultAvatar
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [lang, setLang] = useState("es");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatEnd = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const micStartAudio = useRef(new Audio("/assets/mic-start.mp3"));
  const micStopAudio = useRef(new Audio("/assets/mic-stop.mp3"));
  const nudgeAudio = useRef(new Audio("/assets/nudge.mp3"));
  const msgAudio = useRef(new Audio("/assets/alert.mp3"));

  const [bgImage, setBgImage] = useState(
    () => localStorage.getItem("gemma_bgImage") || ""
  );

  // --- Save settings to localStorage ---
  useEffect(() => {
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("statusMsg", statusMsg);
  }, [nickname, statusMsg]);

  // --- Restore chat on reload ---
  useEffect(() => {
    const saved = localStorage.getItem("gemma_messages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // --- Scroll chat and background color ---
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
    document.body.style.background = dark ? "#20242b" : "#dbe9f6";
  }, [messages, dark]);

  // --- Reset chat on language switch ---
  useEffect(() => {
    setMessages([{ role: "bot", content: t[lang].welcome }]);
    // eslint-disable-next-line
  }, [lang]);

  // --- Save background image to localStorage ---
  useEffect(() => {
    if (bgImage)
      localStorage.setItem("gemma_bgImage", bgImage);
    else
      localStorage.removeItem("gemma_bgImage");
  }, [bgImage]);

  // --- TTS (voice replies) ---
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "bot") {
      const isToolCall =
        last.content.trim().startsWith("{") ||
        last.content.includes('"tool_call"');
      if (!voiceEnabled || isToolCall) return;
      msgAudio.current.currentTime = 0;
      msgAudio.current.play().catch(() => { });
      const utterance = new window.SpeechSynthesisUtterance(last.content);
      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, lang, voiceEnabled]);

  // --- Voice input (mic) ---
  const startListening = () => {
    if (recognitionRef.current) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn’t support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      micStartAudio.current.currentTime = 0;
      micStartAudio.current.play().catch(() => { });
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      micStopAudio.current.currentTime = 0;
      micStopAudio.current.play().catch(() => { });
    };
    recognition.onerror = (event) => {
      setListening(false);
      recognitionRef.current = null;
      console.error("Speech recognition error:", event.error);
    };
    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.trim().replace(/[.!?]+$/, "");
      setInput(transcript);
      sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- Nudge animation and sound ---
  const doNudge = () => {
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content:
          lang === "es"
            ? "Has enviado un zumbido."
            : "You have just sent a Nudge!",
      },
    ]);
    nudgeAudio.current.currentTime = 0;
    nudgeAudio.current.play().catch(() => { });
    const appCard = document.querySelector("#msn-card");
    if (appCard) {
      appCard.classList.add("nudge");
      setTimeout(() => appCard.classList.remove("nudge"), 650);
    }
    const appRoot = document.body;
    if (appRoot) {
      appRoot.classList.add("window-nudge");
      setTimeout(() => appRoot.classList.remove("window-nudge"), 650);
    }
  };

  // ==========Start new chat function================


  function startNewChat() {
    localStorage.removeItem("gemmaSessionId");
    localStorage.removeItem("gemma_messages");
    // Optionally clear nickname/status
    // localStorage.removeItem("nickname");
    // localStorage.removeItem("statusMsg");

    setMessages([
      {
        role: "bot",
        content: t[lang].welcome,
      },
    ]);
    setInput("");
    // When user sends next message, getSessionId() will create a new one
  }

  // --- Core send function ---
  const sendMessage = async (customInput) => {
    const msg = String(
      customInput !== undefined ? customInput : input
    ).trim();
    if (!msg) return;
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // ====== NEW: Always send sessionId ======
      const sessionId = getSessionId();
      // =========================================
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3:8b",
          prompt: msg,
          stream: false,
          lang: lang,
          sessionId, // <<=== IMPORTANT: required for backend memory
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();

      let botReply = "";
      try {
        const possibleJSON = JSON.parse(data.response);
        if (possibleJSON.tool_call) {
          botReply = "🤖 (Sorry, I couldn't fetch the tool result. Try again!)";
        } else {
          botReply = data.response.trim();
        }
      } catch {
        botReply = data.response.trim();
      }
      const updatedMessages = [
        ...newMessages,
        { role: "bot", content: botReply },
      ];
      setMessages(updatedMessages);
      localStorage.setItem("gemma_messages", JSON.stringify(updatedMessages));

      const defaultSuggestions =
        lang === "es"
          ? ["Dime más", "Explícamelo diferente", "Ejemplo por favor"]
          : ["Tell me more", "Explain differently", "Give me an example"];
      setSuggestions(defaultSuggestions);
    } catch (err) {
      const fallback = {
        role: "bot",
        content:
          lang === "es"
            ? `⚠️ Error: ${err.message || "No se pudo conectar con el modelo."}`
            : `⚠️ Error: ${err.message || "Could not connect to the model."}`,
      };
      const errorMessages = [...newMessages, fallback];
      setMessages(errorMessages);
      localStorage.setItem("gemma_messages", JSON.stringify(errorMessages));
      setSuggestions([]);
    }

    setInput("");
    setLoading(false);
  };

  const handleSuggestionClick = (sug) => {
    setInput("");
    setSuggestions([]);
    setTimeout(() => sendMessage(sug), 100);
  };

  const pal = getPalette(dark);
  const isDefaultAvatar = avatar === defaultAvatar;

  return {
    // Chat state/logic
    messages,
    setMessages,
    input,
    setInput,
    sendMessage,
    loading,
    suggestions,
    setSuggestions,
    handleSuggestionClick,
    listening,
    startListening,
    nickname,
    setNickname,
    statusMsg,
    setStatusMsg,
    avatar,
    setAvatar,
    isDefaultAvatar,
    voiceEnabled,
    setVoiceEnabled,
    lang,
    setLang,
    dark,
    setDark,
    doNudge,
    pal,
    t,
    chatEnd,
    botAvatar,
    startNewChat,
    bgImage,
    setBgImage
  };
}
