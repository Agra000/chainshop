import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper text-ink-soft">
        <Compass size={26} />
      </div>
      <h1 className="font-display text-xl font-semibold text-ink">Page not found</h1>
      <p className="text-sm text-ink-soft">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Back to homepage
      </Link>
    </div>
  );
}
