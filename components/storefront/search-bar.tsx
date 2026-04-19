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
}

export function SearchBar({ initialQuery = "", autoFocus = false, className }: SearchBarProps) {
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
        "relative flex items-center h-10 rounded-full border bg-white transition-all duration-200",
        focused
          ? "border-brand-gold shadow-sm ring-1 ring-brand-gold/20"
          : "border-brand-border hover:border-brand-border-dark",
        className
      )}
    >
      {/* Submit / search icon */}
      <button
        type="submit"
        aria-label="Search"
        className="flex h-full flex-shrink-0 items-center pl-3 pr-1.5 text-gray-400 hover:text-brand-navy transition-colors"
      >
        <Search className="h-[15px] w-[15px]" />
      </button>

      {/* Animated "Shop for [word]" overlay — only when idle */}
      {showPlaceholder && (
        <span
          className="pointer-events-none absolute left-9 right-3 flex items-center gap-1 text-sm text-gray-400 select-none whitespace-nowrap overflow-hidden"
          aria-hidden
        >
          Shop for&nbsp;
          <span
            className="font-medium text-brand-navy"
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

      {/* Real input — transparent placeholder so overlay shows instead */}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete="off"
        className="flex-1 min-w-0 bg-transparent pr-3 text-sm text-brand-text outline-none placeholder:text-transparent"
        aria-label="Search products"
      />
    </form>
  );
}
