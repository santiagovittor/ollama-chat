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
  const chatEnd = useRef(null);

  const [suggestions, setSuggestions] = useState([]);


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

  useEffect(() => {
    localStorage.setItem('nickname', nickname);
    localStorage.setItem('statusMsg', statusMsg);
  }, [nickname, statusMsg]);

  useEffect(() => {
    const saved = localStorage.getItem('gemma_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
    document.body.style.background = dark ? '#20242b' : '#dbe9f6';
  }, [messages, dark]);

  useEffect(() => {
    setMessages([{ role: 'bot', content: t[lang].welcome }]);
    // eslint-disable-next-line
  }, [lang]);

  const doNudge = () => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: lang === 'es' ? 'Has enviado un zumbido.' : 'You have just sent a Nudge!' }
    ]);
    nudgeAudio.currentTime = 0;
    nudgeAudio.play().catch(e => { });
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

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].role === 'bot') {
      msgAudio.currentTime = 0;
      msgAudio.play().catch(e => { });
    }
    // eslint-disable-next-line
  }, [messages]);

  const sendMessage = async (customInput) => {
    const msg = customInput !== undefined ? customInput : input;
    if (!msg.trim()) return;
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
      // Console log for debugging
      console.log("🤖 Response from proxy:", data);
  
      // Handle model fallback if the proxy returns JSON instead of text (safety!)
      let botReply = "";
      try {
        const possibleJSON = JSON.parse(data.response);
        if (possibleJSON.tool_call) {
          // If still JSON, display a fallback
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
    setTimeout(() => sendMessage(sug), 100); // auto-send after 100ms for UX smoothness
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

  useEffect(() => {
    const handleFocus = () => {
      document.body.style.paddingBottom = '80px';
    };
    const handleBlur = () => {
      document.body.style.paddingBottom = '0';
    };
    const inputEl = document.querySelector('input');
    inputEl?.addEventListener('focus', handleFocus);
    inputEl?.addEventListener('blur', handleBlur);
    return () => {
      inputEl?.removeEventListener('focus', handleFocus);
      inputEl?.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes nudgeShake {
        10% { transform: translate(-4px, 0); }
        20% { transform: translate(5px, 0); }
        30% { transform: translate(-5px, 0); }
        40% { transform: translate(5px, 0); }
        50% { transform: translate(-4px, 0); }
        60% { transform: translate(4px, 0); }
        70% { transform: translate(-4px, 0); }
        80% { transform: translate(2px, 0); }
        90% { transform: translate(-1px, 0); }
        100% { transform: translate(0, 0); }
      }
      .nudge {
        animation: nudgeShake 0.6s;
        box-shadow: 0 0 28px 4px #d9ff59a0, 0 0 2px 1px #2fff6780;
      }
      .window-nudge {
        animation: nudgeShake 0.6s;
        background: radial-gradient(ellipse at center, #f8fdca77 0%, transparent 80%);
        transition: background 0.6s;
      }
      @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
      @media (max-width: 600px) {
        #msn-card {
          border-radius: 0 !important;
          width: 100vw !important;
        }
        .header-icons {
          gap: 4px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
                sendMessage(); // no param, uses input
              }
            }}
            placeholder={t[lang].placeholder}
            disabled={loading}
            autoFocus
          />
          <button
            onClick={sendMessage}
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
