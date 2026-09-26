import { ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-navbar-soft bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} ChainShop. Prices shown in Indonesian Rupiah.</p>
        <p className="flex items-center gap-1.5 text-ink-faint">
          <ShieldCheck size={15} className="text-navbar" />
          Every payment is held in escrow until you confirm delivery.
        </p>
      </div>
    </footer>
  );
}
