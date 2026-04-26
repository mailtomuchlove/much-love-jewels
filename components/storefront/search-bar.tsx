"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const FALLBACK_SUGGESTIONS = ["Rings", "Earrings", "Necklaces", "Bracelets", "Under ₹499"];

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  className?: string;
  variant?: "light" | "dark";
}

export function SearchBar({ initialQuery = "", autoFocus = false, className, variant = "light" }: SearchBarProps) {
  const dark = variant === "dark";
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);

  // Fetch dynamic suggestions from DB once on mount
  useEffect(() => {
    fetch("/api/search/suggestions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.suggestions) && data.suggestions.length >= 2) {
          setSuggestions(data.suggestions);
        }
      })
      .catch(() => {});
  }, []);

  // Cycle through suggestions every 2.5 s when idle
  useEffect(() => {
    if (focused || query) return;
    const timer = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setCycleIndex((i) => (i + 1) % suggestions.length);
        setWordVisible(true);
      }, 280);
    }, 2500);
    return () => clearInterval(timer);
  }, [focused, query, suggestions.length]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 1) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const showPlaceholder = !focused && !query;
  const currentWord = suggestions[cycleIndex] ?? "";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center h-10 rounded-full border transition-all duration-200",
        dark
          ? [
              "bg-white/10 text-white",
              focused
                ? "border-brand-gold ring-1 ring-brand-gold/20"
                : "border-white/25 hover:border-white/40",
            ]
          : [
              "bg-white",
              focused
                ? "border-brand-gold shadow-sm ring-1 ring-brand-gold/20"
                : "border-brand-border hover:border-brand-border-dark",
            ],
        className
      )}
    >
      {/* Submit / search icon */}
      <button
        type="submit"
        aria-label="Search"
        className={cn(
          "flex h-full flex-shrink-0 items-center pl-3 pr-1.5 transition-colors",
          dark ? "text-white/50 hover:text-white" : "text-gray-400 hover:text-brand-navy"
        )}
      >
        <Search className="h-[15px] w-[15px]" />
      </button>

      {/* Animated "Shop for [word]" overlay — only when idle */}
      {showPlaceholder && (
        <span
          className={cn(
            "pointer-events-none absolute left-9 right-3 flex items-center gap-1 text-sm select-none whitespace-nowrap overflow-hidden",
            dark ? "text-white/40" : "text-gray-400"
          )}
          aria-hidden
        >
          Shop for&nbsp;
          <span
            className={cn("font-medium", dark ? "text-white/80" : "text-brand-navy")}
            style={{
              opacity: wordVisible ? 1 : 0,
              transform: wordVisible ? "translateY(0)" : "translateY(3px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {currentWord}
          </span>
        </span>
      )}

      {/* Real input */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete="off"
        className={cn(
          "flex-1 min-w-0 bg-transparent pr-3 text-sm outline-none placeholder:text-transparent",
          dark ? "text-white" : "text-brand-text"
        )}
        aria-label="Search products"
      />
    </form>
  );
}
