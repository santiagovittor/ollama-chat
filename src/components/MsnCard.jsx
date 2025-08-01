import React from "react";
import styles from "./MsnCard.module.scss";

export default function MsnCard({
  children,
  className = "",
  dark,
  isNudging = false,
  ...props
}) {
  // Always add .msnCard, then the theme as a modifier, then windowNudge if needed
  const cardClass = [
    styles.msnCard,
    dark ? styles.dark : styles.light, // modifier (should become "msnCard dark" or "msnCard light")
    isNudging ? styles.windowNudge : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}
