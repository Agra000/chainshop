import { ShoppingCart, ShieldCheck, LayoutGrid, Lock } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-navbar-soft bg-gradient-to-br from-navbar-soft via-white to-white">
      <div className="grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="font-display text-2xl font-bold leading-snug text-ink sm:text-[28px]">
            Shop like always.{" "}
            <span className="text-navbar">Your money waits in escrow until the order lands.</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-ink-soft">
            Prices are in Rupiah, checkout feels like any marketplace — the
            difference is what happens after you pay: funds sit in a smart
            contract and only reach the seller once you confirm the parcel
            arrived.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navbar-soft text-navbar">
                <LayoutGrid size={15} strokeWidth={2.25} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink">13</p>
                <p className="text-ink-faint">categories to browse</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navbar-soft text-navbar">
                <Lock size={14} strokeWidth={2.25} />
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-ink">0%</p>
                <p className="text-ink-faint">held by anyone but the contract</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto hidden h-40 w-full max-w-[220px] items-center justify-center md:flex">
          <EscrowCartIllustration />
        </div>
      </div>
    </section>
  );
}

function EscrowCartIllustration() {
  return (
    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-sm">
      <ShoppingCart size={60} strokeWidth={1.5} className="text-navbar" />
      <span className="absolute bottom-2 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-navbar text-white shadow-md ring-4 ring-white">
        <ShieldCheck size={20} strokeWidth={2.25} />
      </span>
    </div>
  );
}
