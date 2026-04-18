import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-cream px-4 text-center">
      <p className="text-6xl font-bold text-brand-gold mb-4">404</p>
      <h1 className="font-poppins text-2xl font-bold text-brand-navy mb-2">
        Page Not Found
      </h1>
      <p className="text-brand-text-muted text-sm mb-8 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-md bg-brand-navy text-white text-sm font-medium hover:bg-brand-navy-light transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/collections/all"
          className="px-6 py-2.5 rounded-md border border-brand-navy text-brand-navy text-sm font-medium hover:bg-brand-navy hover:text-white transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
