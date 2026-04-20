import Image from "next/image";
import Link from "next/link";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export type BeholdPost = {
  id: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  sizes?: {
    medium?: { mediaUrl: string };
    large?: { mediaUrl: string };
  };
};

interface InstagramSectionProps {
  handle: string;
  posts: BeholdPost[];
}

export function InstagramSection({ handle, posts }: InstagramSectionProps) {
  const profileUrl = `https://www.instagram.com/${handle}`;

  return (
    <section className="section-sm border-t border-brand-border bg-brand-cream">
      <div className="container-site">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <InstagramIcon className="w-5 h-5 text-brand-gold mb-3" />
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-text-muted mb-1.5">
            Follow Along
          </p>
          <h2 className="heading-h2">@{handle}</h2>
          <p className="text-sm text-brand-text-muted mt-2">Real jewels, real moments.</p>
        </div>

        {/* Grid */}
        <div className={`grid gap-2 lg:gap-3 ${
          posts.length <= 6 ? "grid-cols-3" :
          posts.length === 4 ? "grid-cols-2 sm:grid-cols-4" :
          "grid-cols-3 lg:grid-cols-4"
        }`}>
          {posts.map((post) => {
            const imgSrc =
              post.mediaType === "VIDEO"
                ? post.thumbnailUrl ?? post.mediaUrl
                : post.sizes?.medium?.mediaUrl ?? post.sizes?.large?.mediaUrl ?? post.mediaUrl;
            const alt = post.caption?.slice(0, 80) ?? "Instagram post";

            return (
              <Link
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden block"
              >
                <Image
                  src={imgSrc}
                  alt={alt}
                  fill
                  sizes="(max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Follow button */}
        <div className="text-center mt-7">
          <Link
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-brand-border-dark rounded-full text-sm font-medium text-brand-navy hover:bg-brand-navy hover:text-white hover:border-brand-navy transition-colors duration-200"
          >
            <InstagramIcon className="w-4 h-4" />
            Follow on Instagram
          </Link>
        </div>
      </div>
    </section>
  );
}
