"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

interface SalonNavLinkProps {
  className?: string;
  style?: CSSProperties;
  onNavigate?: () => void;
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>;
  children?: ReactNode;
}

export function SalonNavLink({
  className,
  style,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
  children,
}: SalonNavLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate?.();
    window.dispatchEvent(new CustomEvent("goto-salon", { detail: { href: "/salon" } }));
  };

  return (
    <a
      href="/salon"
      onClick={handleClick}
      className={className}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children ?? "Salon ✦"}
    </a>
  );
}
