import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const defaultAvatar = 'https://ui-avatars.com/api/?name=U&background=7EC0EE&color=fff&rounded=true';
const botAvatar = 'https://ui-avatars.com/api/?name=K&background=757575&color=fff&rounded=true';

const nudgeAudio = new Audio('/assets/nudge.mp3');
const msgAudio = new Audio('/assets/alert.mp3');

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: '👋 ¡Bienvenido! Chatea como en el viejo Windows Live Messenger.' }
  ]);
  const [nickname, setNickname] = useState(() => localStorage.getItem('nickname') || 'Tú');
  const [statusMsg, setStatusMsg] = useState(() => localStorage.getItem('statusMsg') || '');
  const [avatar, setAvatar] = useState(() =>
    localStorage.getItem('avatar') || defaultAvatar
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [lang, setLang] = useState('es');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const chatEnd = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const micStartAudio = useRef(new Audio('/assets/mic-start.mp3'));
  const micStopAudio = useRef(new Audio('/assets/mic-stop.mp3'));

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const t = {
    es: {
      welcome: '👋 ¡Bienvenido! Chatea como en el viejo Windows Live Messenger.',
      placeholder: 'Escribe un mensaje…',
      typing: 'kikibot está pensando',
      send: 'Enviar',
      nudge: 'Zumbido',
      langSwitch: 'EN',
    },
    en: {
      welcome: '👋 Welcome! Chat like in old Windows Live Messenger.',
      placeholder: 'Type a message…',
      typing: 'kikibot is typing…',
      send: 'Send',
      nudge: 'Nudge',
      langSwitch: 'ES',
    }
  };

  // Responsive/mobile header fix: apply flex-wrap and reduce icon/button size on mobile
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .header-icons {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      @media (max-width: 600px) {
        #msn-card {
          border-radius: 0 !important;
          width: 100vw !important;
        }
        .header-icons {
          gap: 2px !important;
          flex-wrap: wrap;
        }
        .header-icons button {
          font-size: 12px !important;
          padding: 3px 7px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('statusMsg', statusMsg);
  }, [nickname, statusMsg]);

  // Restore chat on reload
  useEffect(() => {
    const saved = localStorage.getItem('gemma_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Scroll chat
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
    document.body.style.background = dark ? '#20242b' : '#dbe9f6';
  }, [messages, dark]);

  // Reset chat on language switch
  useEffect(() => {
    setMessages([{ role: 'bot', content: t[lang].welcome }]);
    // eslint-disable-next-line
  }, [lang]);

  // Handle TTS (voice replies) only if enabled and not tool call JSON
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'bot') {
      const isToolCall = last.content.trim().startsWith('{') || last.content.includes('"tool_call"');
      if (!voiceEnabled || isToolCall) return;
      msgAudio.currentTime = 0;
      msgAudio.play().catch(() => { });
      const utterance = new window.SpeechSynthesisUtterance(last.content);
      utterance.lang = lang === 'es' ? 'es-ES' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, [messages, lang, voiceEnabled]);

  // Voice input (mic)
  const startListening = () => {
    if (recognitionRef.current) return; // prevent double-start
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser doesn’t support speech recognition.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'es' ? 'es-ES' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      micStartAudio.current.currentTime = 0;
      micStartAudio.current.play().catch(() => {});
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      micStopAudio.current.currentTime = 0;
      micStopAudio.current.play().catch(() => {});
    };
    recognition.onerror = (event) => {
      setListening(false);
      recognitionRef.current = null;
      console.error('Speech recognition error:', event.error);
    };
    recognition.onresult = (event) => {
      let transcript = event.results[0][0].transcript;
      transcript = transcript.trim().replace(/[.!?]+$/, '');
      setInput(transcript);
      sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const doNudge = () => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: lang === 'es' ? 'Has enviado un zumbido.' : 'You have just sent a Nudge!' }
    ]);
    nudgeAudio.currentTime = 0;
    nudgeAudio.play().catch(() => {});
    const appCard = document.querySelector('#msn-card');
    if (appCard) {
      appCard.classList.add('nudge');
      setTimeout(() => appCard.classList.remove('nudge'), 650);
    }
    const appRoot = document.body;
    if (appRoot) {
      appRoot.classList.add('window-nudge');
      setTimeout(() => appRoot.classList.remove('window-nudge'), 650);
    }
  };

  // Core send function - always string, no [object Object] bug
  const sendMessage = async (customInput) => {
    const msg = String(customInput !== undefined ? customInput : input).trim();
    if (!msg) return;
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3',
          prompt: msg,
          stream: false,
          lang: lang
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      // Handle model fallback if proxy returns JSON (safety)
      let botReply = '';
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
      const updatedMessages = [...newMessages, { role: 'bot', content: botReply }];
      setMessages(updatedMessages);
      localStorage.setItem('gemma_messages', JSON.stringify(updatedMessages));

      const defaultSuggestions = lang === 'es'
        ? ["Dime más", "Explícamelo diferente", "Ejemplo por favor"]
        : ["Tell me more", "Explain differently", "Give me an example"];
      setSuggestions(defaultSuggestions);

    } catch (err) {
      const fallback = {
        role: 'bot',
        content: lang === 'es'
          ? `⚠️ Error: ${err.message || 'No se pudo conectar con el modelo.'}`
          : `⚠️ Error: ${err.message || 'Could not connect to the model.'}`
      };
      const errorMessages = [...newMessages, fallback];
      setMessages(errorMessages);
      localStorage.setItem('gemma_messages', JSON.stringify(errorMessages));
      setSuggestions([]);
    }

    setInput('');
    setLoading(false);
  };

  const handleSuggestionClick = (sug) => {
    setInput('');
    setSuggestions([]);
    setTimeout(() => sendMessage(sug), 100);
  };
  const pal = dark
    ? {
      bg: '#23272e',
      card: '#23272e',
      bubbleUser: '#447ace',
      bubbleBot: '#2e3241',
      text: '#e8f0fa',
      border: '#304057',
      header: 'linear-gradient(90deg, #333b48 0%, #4a5670 100%)',
      input: '#1e2228',
      placeholder: '#97aac5'
    }
    : {
      bg: '#dbe9f6',
      card: '#fafdff',
      bubbleUser: '#39a2ff',
      bubbleBot: '#f0f4fb',
      text: '#222f3b',
      border: '#90bae6',
      header: 'linear-gradient(90deg, #5ebcfb 0%, #a1d1f9 100%)',
      input: '#fff',
      placeholder: '#8fa8c6'
    };

  // Helper to know if using default avatar
  const isDefaultAvatar = avatar === defaultAvatar;

  return (
    <div style={{
      height: '100dvh',
      width: '100dvw',
      margin: 0,
      padding: 0,
      background: pal.bg,
      fontFamily: 'Segoe UI, Arial, sans-serif',
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'center',
    }}>
      <div id="msn-card" style={{
        height: '100dvh',
        width: '100dvw',
        maxWidth: '100%',
        maxHeight: '100dvh',
        borderRadius: window.innerWidth > 600 ? 9 : 0,
        border: 'none',
        boxShadow: 'none',
        background: pal.card,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div
          style={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            padding: '13px 8px',
            background: pal.header,
            borderBottom: `1.5px solid ${pal.border}`,
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Avatar with upload */}
            <label style={{ cursor: 'pointer', marginRight: 2 }}>
              <img
                src={avatar}
                alt="Tú"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 18,
                  border: isDefaultAvatar ? '1.5px solid #fff' : '1.5px solid transparent',
                  objectFit: 'cover',
                  background: isDefaultAvatar ? 'none' : '#c7e5f9'
                }}
                title="Haz click para cambiar tu avatar"
              />
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = evt => {
                    setAvatar(evt.target.result);
                    localStorage.setItem('avatar', evt.target.result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="Tu nombre"
                style={{
                  fontWeight: 700,
                  fontSize: 15.5,
                  border: 'none',
                  background: 'transparent',
                  color: '#fff',
                  outline: 'none',
                  width: '120px'
                }}
              />
              <input
                type="text"
                value={statusMsg}
                onChange={e => setStatusMsg(e.target.value)}
                placeholder={lang === 'es' ? 'Mensaje de estado' : 'Status message'}
                style={{
                  fontSize: 13.2,
                  border: 'none',
                  background: 'transparent',
                  color: '#e2efff',
                  outline: 'none',
                  fontStyle: 'italic',
                  width: '160px'
                }}
              />
            </div>
          </div>

          <div className="header-icons" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              style={{
                border: 'none',
                borderRadius: 8,
                background: dark ? '#383f4b' : '#e4ecfa',
                color: dark ? '#ffe36b' : '#5670a0',
                fontWeight: 700,
                padding: '4px 11px',
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: dark ? '0 1px 3px #0e1015' : '0 1px 3px #b4cff5'
              }}
              title={voiceEnabled ? 'Disable voice replies' : 'Enable voice replies'}
            >
              {voiceEnabled ? '🗣️ ON' : '🔇 OFF'}
            </button>

            <button
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              style={{
                border: 'none',
                borderRadius: 8,
                background: dark ? '#272b3c' : '#c2e0fc',
                color: dark ? '#ffe36b' : '#4a78b6',
                fontWeight: 700,
                padding: '4px 12px',
                fontSize: 16,
                marginRight: 1,
                cursor: 'pointer',
                boxShadow: '0 1px 3px #aec2d5'
              }}
              title="Cambiar idioma"
            >
              {t[lang].langSwitch}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                border: 'none',
                borderRadius: 8,
                background: dark ? '#383f4b' : '#e4ecfa',
                color: dark ? '#ffe36b' : '#5670a0',
                fontWeight: 700,
                padding: '4px 11px',
                fontSize: 17,
                cursor: 'pointer',
                boxShadow: dark ? '0 1px 3px #0e1015' : '0 1px 3px #b4cff5'
              }}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={doNudge}
              style={{
                border: 'none',
                borderRadius: 8,
                background: dark ? '#344060' : '#eaf5fe',
                color: dark ? '#ffe36b' : '#2473af',
                fontWeight: 700,
                padding: '4px 13px',
                fontSize: 18,
                marginLeft: 2,
                cursor: 'pointer',
                boxShadow: dark ? '0 1px 3px #10131a' : '0 1px 3px #b4cff5'
              }}
              title={t[lang].nudge}
            >
              💥
            </button>
          </div>
        </div>

        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            background: dark ? '#22242a' : '#eaf3fb',
            padding: 11,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
                gap: 8
              }}
            >
              {msg.role === 'bot' && (
                <img
                  src={botAvatar}
                  alt="Bot"
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 14,
                    border: `1px solid ${pal.border}`,
                    objectFit: 'cover'
                  }}
                />
              )}
              <div
                style={{
                  background: msg.role === 'user' ? pal.bubbleUser : pal.bubbleBot,
                  color: msg.role === 'user' ? '#fff' : pal.text,
                  borderRadius: msg.role === 'user' ? '18px 16px 6px 18px' : '16px 18px 18px 6px',
                  padding: '8px 13px',
                  fontSize: 15,
                  maxWidth: '74vw',
                  minHeight: 22,
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user'
                    ? '0 2px 14px #96d8ff25'
                    : '0 1px 8px #dae7f825',
                  border: `1px solid ${pal.border}`
                }}
              >
                <ReactMarkdown
                  children={msg.content}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} />,
                    strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
                    em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
                  }}
                />
              </div>
              {msg.role === 'user' && (
                <img
                  src={avatar}
                  alt="Tú"
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 14,
                    border: isDefaultAvatar ? `1px solid ${pal.border}` : '1px solid transparent',
                    objectFit: 'cover',
                    background: isDefaultAvatar ? 'none' : '#c7e5f9'
                  }}
                />
              )}
            </div>
          ))}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              margin: '6px 0 4px 32px'
            }}>
              <span style={{
                fontStyle: 'italic',
                fontSize: 14,
                color: dark ? '#aad3ff' : '#4c5d81'
              }}>{t[lang].typing}</span>
              <div style={{
                display: 'flex',
                gap: 3
              }}>
                {[...Array(3)].map((_, i) => (
                  <span key={i} style={{
                    width: 6,
                    height: 6,
                    background: dark ? '#aad3ff' : '#4c5d81',
                    borderRadius: '50%',
                    animation: `blink 1.2s ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>
        {suggestions.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
            margin: '6px 0 0 4px'
          }}>
            <span style={{
              color: '#86a0b8',
              fontWeight: 600,
              fontSize: 13,
              marginRight: 6
            }}>🤖 {lang === 'es' ? 'Sugerencias:' : 'Suggestions:'}</span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                style={{
                  background: pal.bubbleBot,
                  color: pal.text,
                  border: `1.2px solid ${pal.border}`,
                  borderRadius: 9,
                  padding: '3px 12px',
                  fontSize: 13.3,
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'background 0.18s'
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        )}
        {/* Input */}
        <div
          style={{
            flex: '0 0 auto',
            borderTop: `1.5px solid ${pal.border}`,
            background: pal.input,
            padding: '10px 10px 10px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <button
            onClick={startListening}
            style={{
              background: listening ? '#ffeb3b' : pal.bubbleBot,
              color: pal.text,
              border: `1px solid ${pal.border}`,
              borderRadius: 13,
              fontSize: 16,
              padding: '6px 12px',
              cursor: 'pointer',
              boxShadow: listening ? '0 0 10px #ffeb3b99' : 'none',
              animation: listening ? 'pulse 1s infinite' : 'none'
            }}
            title={listening ? 'Listening…' : (lang === 'es' ? 'Hablar' : 'Speak')}
          >
            {listening ? '🎧' : '🎤'}
          </button>
          <input
            type="text"
            style={{
              flex: 1,
              border: `1.3px solid ${pal.border}`,
              borderRadius: 16,
              padding: '8px 13px',
              fontSize: 15,
              outline: 'none',
              background: pal.input,
              color: pal.text,
              fontFamily: 'inherit',
              boxShadow: dark ? '0 2px 4px #1a1d27aa inset' : '0 2px 4px #dbe9f6aa inset'
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={t[lang].placeholder}
            disabled={loading}
            autoFocus
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              background: pal.bubbleUser,
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              borderRadius: 13,
              fontSize: 15,
              padding: '7px 16px 7px 14px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 1px 4px #84b8eb33'
            }}
            title={t[lang].send}
          >
            {t[lang].send}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
