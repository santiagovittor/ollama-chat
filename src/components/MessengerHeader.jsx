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
import styles from "./MessengerHeader.module.scss";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  // Mobile/desktop detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile && menuOpen) setMenuOpen(false);
  }, [isMobile, menuOpen]);

  // Close menu on click outside (mobile)
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (
        !menuRef.current?.contains(e.target) &&
        !document.querySelector(`.${styles.hamburgerBtn}`)?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

  const renderIconButtons = () => (
    <>
      <button
        className={styles.headerBtn}
        onClick={startNewChat}
        title={lang === "es" ? "Nuevo chat" : "New Chat"}
      >
        <MessageSquarePlus size={18} strokeWidth={2} />
      </button>
      <button
        className={`${styles.headerBtn} ${voiceEnabled ? styles.active : ""}`}
        onClick={() => setVoiceEnabled((v) => !v)}
        title={voiceEnabled ? "Disable voice replies" : "Enable voice replies"}
      >
        {voiceEnabled ? <Mic size={18} strokeWidth={2} /> : <MicOff size={18} strokeWidth={2} />}
      </button>
      <button
        className={styles.headerBtn}
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
      >
        <Flag code={lang === "es" ? "GB" : "ES"} style={{ width: 20, height: 14, borderRadius: 3 }} />
      </button>
      <button
        className={styles.headerBtn}
        onClick={() => setDark((d) => !d)}
        title={dark ? "Modo claro" : "Modo oscuro"}
      >
        {dark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
      </button>
      <button
        className={styles.headerBtn}
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
        className={styles.headerBtn}
        title={lang === "es" ? "Cambiar fondo del chat" : "Change chat wallpaper"}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <ImageIcon size={18} strokeWidth={2} />
      </button>
      {bgImage && (
        <button
          className={styles.headerBtn}
          title={lang === "es" ? "Quitar fondo del chat" : "Remove chat wallpaper"}
          onClick={() => setBgImage("")}
        >
          <XCircle size={18} strokeWidth={2} />
        </button>
      )}
    </>
  );

  return (
    <div className={`${styles.msnHeader} ${dark ? styles.dark : styles.light}`}>
      <div className={styles.headerProfile}>
        {/* MSN-style avatar frame */}
        <label className={styles.avatarUpload}>
          <div className={styles.msnAvatarFrame} title="Haz click para cambiar tu avatar">
            <img
              src={avatar}
              alt="Tu avatar"
              className={styles.msnAvatarImg}
            />
          </div>
          <span className={styles.avatarPencil}>
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
        <div className={styles.profileFields}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Tu nombre"
            className={styles.nicknameInput}
          />
          <input
            type="text"
            value={statusMsg}
            onChange={(e) => setStatusMsg(e.target.value)}
            placeholder={lang === "es" ? "Mensaje de estado" : "Status message"}
            className={styles.statusInput}
          />
        </div>
      </div>

      <div className={styles.headerIcons} style={{ position: "relative" }}>
        {/* Hamburger (mobile only) */}
        {isMobile && (
          <button
            className={`${styles.headerBtn} ${styles.hamburgerBtn}`}
            onClick={() => setMenuOpen((v) => !v)}
            title="Menú"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Desktop: always show icons horizontally */}
        {!isMobile && (
          <div className={styles.iconToolbar}>
            {renderIconButtons()}
          </div>
        )}

        {/* Mobile: icon menu popover (vertical) */}
        {isMobile && menuOpen && (
          <div className={`${styles.iconMenuPopover} ${styles.iconMenuPopoverOpen}`} ref={menuRef}>
            {renderIconButtons()}
          </div>
        )}
      </div>
    </div>
  );
}
