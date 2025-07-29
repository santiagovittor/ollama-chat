import React from "react";
import Flag from "react-world-flags";

export default function MessengerHeader({
    avatar,
    setAvatar,
    nickname,
    setNickname,
    statusMsg,
    setStatusMsg,
    defaultAvatar,
    voiceEnabled,
    setVoiceEnabled,
    lang,
    setLang,
    dark,
    setDark,
    doNudge,
    t,
    pal,
}) {
    // Detect if using default avatar
    const isDefaultAvatar = avatar === defaultAvatar;

    // Avatar upload handler
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

    return (
        <div
            style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                padding: "13px 8px",
                background: pal.header,
                borderBottom: `1.5px solid ${pal.border}`,
                justifyContent: "space-between",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Avatar with upload */}
                <label
                    className="avatar-upload"
                    style={{
                        position: "relative",
                        cursor: "pointer",
                        marginRight: 2,
                        display: "inline-block",
                    }}
                >
                    {isDefaultAvatar ? (
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 18,
                                background: "#e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                                color: "#888",
                                border: "1.5px dashed #bbb",
                            }}
                            title="Haz click para cambiar tu avatar"
                        >
                            ✏️
                        </div>
                    ) : (
                        <img
                            src={avatar}
                            alt="Tú"
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: 18,
                                border: "1.5px solid transparent",
                                objectFit: "cover",
                                background: "#c7e5f9",
                                display: "block",
                            }}
                            title="Haz click para cambiar tu avatar"
                        />
                    )}

                    {/* Always render the pencil */}
                    <span
                        className="avatar-pencil"
                        style={{
                            position: "absolute",
                            right: 2,     // Slightly inside the avatar
                            bottom: 2,    // Slightly inside the avatar
                            width: 20,
                            height: 20,
                            background: "#fff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                            opacity: 0.5,  // or 0 for hover-only
                            pointerEvents: "none",
                            transition: "opacity 0.2s",
                            zIndex: 99,
                        }}
                    >
                        {/* SVG for a sharp pencil (recommended) */}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="#FFF" />
                            <path d="M4 17.25V20h2.75l8.13-8.13-2.75-2.75L4 17.25zM20.71 7.04c.19-.19.29-.44.29-.71 0-.27-.1-.52-.29-.71l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#757575" />
                        </svg>
                    </span>

                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleAvatarChange}
                    />
                </label>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Tu nombre"
                        style={{
                            fontWeight: 700,
                            fontSize: 15.5,
                            border: "none",
                            background: "transparent",
                            color: "#fff",
                            outline: "none",
                            width: "120px",
                        }}
                    />
                    <input
                        type="text"
                        value={statusMsg}
                        onChange={(e) => setStatusMsg(e.target.value)}
                        placeholder={lang === "es" ? "Mensaje de estado" : "Status message"}
                        style={{
                            fontSize: 13.2,
                            border: "none",
                            background: "transparent",
                            color: "#e2efff",
                            outline: "none",
                            fontStyle: "italic",
                            width: "160px",
                        }}
                    />
                </div>
            </div>

            <div className="header-icons" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                    onClick={() => setVoiceEnabled((v) => !v)}
                    style={{
                        border: "none",
                        borderRadius: 8,
                        background: dark ? "#383f4b" : "#e4ecfa",
                        color: dark ? "#ffe36b" : "#5670a0",
                        fontWeight: 700,
                        padding: "4px 11px",
                        fontSize: 16,
                        cursor: "pointer",
                        boxShadow: dark ? "0 1px 3px #0e1015" : "0 1px 3px #b4cff5",
                    }}
                    title={voiceEnabled ? "Disable voice replies" : "Enable voice replies"}
                >
                    {voiceEnabled ? "🗣️" : "🔇"}
                </button>

                <button
                    onClick={() => setLang(lang === "es" ? "en" : "es")}
                    style={{
                        border: "none",
                        borderRadius: 8,
                        background: dark ? "#272b3c" : "#c2e0fc",
                        color: dark ? "#ffe36b" : "#4a78b6",
                        fontWeight: 700,
                        padding: "4px 12px",
                        fontSize: 16,
                        marginRight: 1,
                        cursor: "pointer",
                        boxShadow: "0 1px 3px #aec2d5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    title={lang === "es" ? "Switch to English" : "Cambiar a Español"}
                >
                    <Flag
                        code={lang === "es" ? "GB" : "ES"} // GB for English, ES for Spanish
                        style={{
                            width: 20,
                            height: 14,
                            objectFit: "cover",
                            borderRadius: 3,
                        }}
                    />
                </button>

                <button
                    onClick={() => setDark((d) => !d)}
                    style={{
                        border: "none",
                        borderRadius: 8,
                        background: dark ? "#383f4b" : "#e4ecfa",
                        color: dark ? "#ffe36b" : "#5670a0",
                        fontWeight: 700,
                        padding: "4px 11px",
                        fontSize: 17,
                        cursor: "pointer",
                        boxShadow: dark ? "0 1px 3px #0e1015" : "0 1px 3px #b4cff5",
                    }}
                    title={dark ? "Modo claro" : "Modo oscuro"}
                >
                    {dark ? "☀️" : "🌙"}
                </button>
                <button
                    onClick={doNudge}
                    style={{
                        border: "none",
                        borderRadius: 8,
                        background: dark ? "#344060" : "#eaf5fe",
                        color: dark ? "#ffe36b" : "#2473af",
                        fontWeight: 700,
                        padding: "4px 13px",
                        fontSize: 18,
                        marginLeft: 2,
                        cursor: "pointer",
                        boxShadow: dark ? "0 1px 3px #10131a" : "0 1px 3px #b4cff5",
                    }}
                    title={t[lang].nudge}
                >
                    💥
                </button>
            </div>
        </div>
    );
}
