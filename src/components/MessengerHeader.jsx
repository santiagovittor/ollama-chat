import React, { useState, useRef, useEffect } from "react";
import Flag from "react-world-flags";
import {
  Menu,
  X,
  MessageSquarePlus,
  Mic,
  MicOff,
  Sun,
  Moon,
  Zap,
  Image as ImageIcon,
  XCircle,
} from "lucide-react";

export default function MessengerHeader({
  avatar,
  setAvatar,
  nickname,
  setNickname,
  statusMsg,
  setStatusMsg,
  defaultAvatar,
  startNewChat,
  voiceEnabled,
  setVoiceEnabled,
  lang,
  setLang,
  dark,
  setDark,
  doNudge,
  t,
  setBgImage,
  bgImage,
}) {
  const isDefaultAvatar = avatar === defaultAvatar;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const fileInputRef = useRef(null);

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 600 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (
        !menuRef.current?.contains(e.target) &&
        !document.querySelector('.hamburger-btn')?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatar(evt.target.result);
      localStorage.setItem("avatar", evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setBgImage(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`msn-header ${dark ? "dark" : "light"}`}>
      <div className="header-profile">
        {/* Avatar with upload */}
        <label className="avatar-upload">
          {isDefaultAvatar ? (
            <div className="avatar avatar-placeholder" title="Haz click para cambiar tu avatar">
              ✏️
            </div>
          ) : (
            <img
              src={avatar}
              alt="Tú"
              className="avatar avatar-img"
              title="Haz click para cambiar tu avatar"
            />
          )}
          <span className="avatar-pencil">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FFF" />
              <path
                d="M4 17.25V20h2.75l8.13-8.13-2.75-2.75L4 17.25zM20.71 7.04c.19-.19.29-.44.29-.71 0-.27-.1-.52-.29-.71l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="#757575"
              />
            </svg>
          </span>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </label>
        <div className="profile-fields">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Tu nombre"
            className="nickname-input"
          />
          <input
            type="text"
            value={statusMsg}
            onChange={(e) => setStatusMsg(e.target.value)}
            placeholder={lang === "es" ? "Mensaje de estado" : "Status message"}
            className="status-input"
          />
        </div>
      </div>

      <div className="header-icons" style={{ position: "relative" }}>
        {/* Hamburger (always rendered, hidden via CSS on desktop) */}
        <button
          className="header-btn hamburger-btn"
          onClick={() => setMenuOpen((v) => !v)}
          title="Menú"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* All icons inside popover, always rendered */}
        <div
          className={`icon-menu-popover${menuOpen ? " open" : ""}`}
          ref={menuRef}
        >
          <button
            className="header-btn new-chat-btn"
            onClick={startNewChat}
            title={lang === "es" ? "Nuevo chat" : "New Chat"}
          >
            <MessageSquarePlus size={18} strokeWidth={2} />
          </button>
          <button
            className={`header-btn voice-btn${voiceEnabled ? " active" : ""}`}
            onClick={() => setVoiceEnabled((v) => !v)}
            title={voiceEnabled ? "Disable voice replies" : "Enable voice replies"}
          >
            {voiceEnabled ? <Mic size={18} strokeWidth={2} /> : <MicOff size={18} strokeWidth={2} />}
          </button>
          <button
            className="header-btn lang-btn"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
          >
            <Flag code={lang === "es" ? "GB" : "ES"} style={{ width: 20, height: 14, borderRadius: 3 }} />
          </button>
          <button
            className="header-btn dark-btn"
            onClick={() => setDark((d) => !d)}
            title={dark ? "Modo claro" : "Modo oscuro"}
          >
            {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
          <button
            className="header-btn nudge-btn"
            onClick={doNudge}
            title={t[lang].nudge}
          >
            <Zap size={18} strokeWidth={2} />
          </button>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleBgImageUpload}
          />
          <button
            className="header-btn"
            title={lang === "es" ? "Cambiar fondo del chat" : "Change chat wallpaper"}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <ImageIcon size={18} strokeWidth={2} />
          </button>
          {bgImage && (
            <button
              className="header-btn"
              title={lang === "es" ? "Quitar fondo del chat" : "Remove chat wallpaper"}
              onClick={() => setBgImage("")}
            >
              <XCircle size={18} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
