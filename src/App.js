import React, { useState, useRef, useEffect } from 'react';

const userAvatar = 'https://ui-avatars.com/api/?name=U&background=7EC0EE&color=fff&rounded=true';
const botAvatar = 'https://ui-avatars.com/api/?name=K&background=757575&color=fff&rounded=true';

const nudgeAudio = new Audio('/assets/nudge.mp3');
const msgAudio = new Audio('/assets/alert.mp3');

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: '👋 ¡Bienvenido! Chatea como en el viejo Windows Live Messenger.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [lang, setLang] = useState('es');
  const chatEnd = useRef(null);

  const baseUrl = 'https://990ca352a67d.ngrok-free.app';

  // Traducciones simples
  const t = {
    es: {
      welcome: '👋 ¡Bienvenido! Chatea como en el viejo Windows Live Messenger.',
      placeholder: 'Escribe un mensaje…',
      typing: 'kikibot está escribiendo…',
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

  // Maintain scroll at the bottom (ALWAYS works even for few messages)
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
    document.body.style.background = dark ? '#20242b' : '#dbe9f6';
  }, [messages, dark]);

  useEffect(() => {
    setMessages([
      { role: 'bot', content: t[lang].welcome }
    ]);
    // eslint-disable-next-line
  }, [lang]);

  // --- Zumbido (nudge) Messenger ---
  const doNudge = () => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: lang === 'es' ? 'Has enviado un zumbido.' : 'You have just sent a Nudge!' }
    ]);
    nudgeAudio.currentTime = 0;
nudgeAudio.play().catch(e => console.log('Nudge play error:', e.message));

    const appCard = document.querySelector('#msn-card');
    if (appCard) {
      appCard.classList.add('nudge');
      setTimeout(() => appCard.classList.remove('nudge'), 650);
    }
  };

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].role === 'bot') {
      msgAudio.currentTime = 0;
msgAudio.play().catch(e => console.log('Msg play error:', e.message));
    }
    // eslint-disable-next-line
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3',
          prompt: lang === 'es'
            ? `Contesta en español. ${input}`
            : `Answer in English. ${input}`,
          stream: false
        }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      setMessages([...newMessages, { role: 'bot', content: data.response.trim() }]);
    } catch (err) {
      alert('Error con Ollama o el proxy. ¿Está todo corriendo?');
    }

    setInput('');
    setLoading(false);
  };

  // Colores y estilos
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
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

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
            padding: '13px 12px',
            background: pal.header,
            borderBottom: `1.5px solid ${pal.border}`,
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={botAvatar}
              alt="Bot"
              style={{ width: 34, height: 34, borderRadius: 18, border: '1.5px solid #fff' }}
            />
            <span
              style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 0.5,
                textShadow: '0 1px 9px #86c7ff44'
              }}
            >
              ChatKiKiTi
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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

        {/* Mensajes: flex container, scrollable */}
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
                    border: `1px solid ${pal.border}`
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
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <img
                  src={userAvatar}
                  alt="Tú"
                  style={{
                    width: 25,
                    height: 25,
                    borderRadius: 14,
                    border: `1px solid ${pal.border}`
                  }}
                />
              )}
            </div>
          ))}
          {loading && (
            <div
              style={{
                color: dark ? '#aad3ff' : '#4c5d81',
                fontStyle: 'italic',
                fontSize: 14,
                margin: '6px 0 4px 32px'
              }}
            >
              {t[lang].typing}
            </div>
          )}
          <div ref={chatEnd} />
        </div>


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
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
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
