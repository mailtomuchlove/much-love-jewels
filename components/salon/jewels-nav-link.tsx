"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

interface JewelsNavLinkProps {
  className?: string;
  style?: CSSProperties;
  onNavigate?: () => void;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
}

export function JewelsNavLink({
  className,
  style,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
  children,
}: JewelsNavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate?.();
    sessionStorage.setItem("arriving-from-salon", "1");
    window.dispatchEvent(new CustomEvent("goto-jewels", { detail: { href: "/" } }));
  };

  return (
    <a
      href="/"
      onClick={handleClick}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children ?? "Our Jewels →"}
    </a>
  );
}
