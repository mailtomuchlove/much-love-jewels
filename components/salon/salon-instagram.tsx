"use client";

import Link from "next/link";
import Image from "next/image";
import type { BeholdPost } from "@/components/storefront/instagram-section";

const InstagramIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: 20, height: 20, ...style }}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

interface SalonInstagramProps {
  handle: string;
  posts: BeholdPost[];
}

export function SalonInstagram({ handle, posts }: SalonInstagramProps) {
  const profileUrl = `https://www.instagram.com/${handle}`;

  const cols =
    posts.length <= 6
      ? "repeat(3, 1fr)"
      : posts.length === 4
        ? "repeat(4, 1fr)"
        : "repeat(4, 1fr)";

  return (
    <section
      style={{
        padding: "clamp(60px,10vw,120px) clamp(20px,6vw,80px)",
        background: "#FAF8F3",
        borderTop: "1px solid #E8E0D0",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <InstagramIcon style={{ color: "#B8975A", margin: "0 auto 16px" }} />
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 10,
            fontWeight: 400,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "#6B6259",
            marginBottom: 12,
          }}
        >
          Follow Along
        </p>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 300,
            color: "#1C1916",
            letterSpacing: "-0.01em",
            marginBottom: 8,
          }}
        >
          @{handle}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 13,
            fontWeight: 300,
            color: "#6B6259",
            letterSpacing: "0.04em",
          }}
        >
          Real brides, real transformations.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: "clamp(6px, 1vw, 12px)",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        {posts.map((post, idx) => {
          const imgSrc =
            post.mediaType === "VIDEO"
              ? (post.thumbnailUrl ?? post.mediaUrl)
              : (post.sizes?.medium?.mediaUrl ?? post.sizes?.large?.mediaUrl ?? post.mediaUrl);
          const alt = post.caption?.slice(0, 80) ?? "Instagram post";

          return (
            <Link
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "relative",
                display: "block",
                aspectRatio: "1/1",
                overflow: "hidden",
                borderRadius: 2,
              }}
              className="group"
            >
              <Image
                src={imgSrc}
                alt={alt}
                fill
                sizes="(max-width: 768px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                unoptimized
                priority={idx < 3}
                loading={idx < 3 ? "eager" : "lazy"}
              />
              <div
                className="absolute inset-0 flex items-center justify-center transition-colors duration-300 group-hover:bg-black/30"
                style={{ background: "transparent" }}
              >
                <InstagramIcon
                  style={{
                    color: "white",
                    opacity: 0,
                    transition: "opacity 0.3s",
                  }}
                  // opacity toggled via group-hover in Tailwind below
                />
              </div>
              {/* Hover overlay icon — Tailwind class applied here */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <InstagramIcon style={{ color: "white" }} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Follow CTA */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <FollowButton href={profileUrl} />
      </div>
    </section>
  );
}

function FollowButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2"
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontSize: 11,
        fontWeight: 400,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "#1C1916",
        border: "1px solid #B8975A",
        padding: "12px 32px",
        textDecoration: "none",
        transition: "background 0.3s, color 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#1C1916";
        e.currentTarget.style.color = "#D4B47A";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#1C1916";
      }}
    >
      <InstagramIcon style={{ width: 14, height: 14 }} />
      Follow on Instagram
    </Link>
  );
}
