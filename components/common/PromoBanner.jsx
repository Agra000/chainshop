export function PromoBanner() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="grid items-center gap-6 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <h1 className="font-display text-2xl font-bold leading-snug text-ink sm:text-[28px]">
            Shop like always. Your money waits in escrow until the order lands.
          </h1>
          <p className="mt-3 max-w-md text-[15px] text-ink-soft">
            Prices are in Rupiah, checkout feels like any marketplace — the
            difference is what happens after you pay: funds sit in a smart
            contract and only reach the seller once you confirm the parcel
            arrived.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <p className="font-display text-lg font-semibold text-ink">13</p>
              <p className="text-ink-faint">categories to browse</p>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-ink">0%</p>
              <p className="text-ink-faint">held by anyone but the contract</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto hidden h-40 w-full max-w-[220px] items-center justify-center md:flex">
          <ReceiptSealIllustration />
        </div>
      </div>
    </section>
  );
}

function ReceiptSealIllustration() {
  return (
    <svg viewBox="0 0 200 160" className="h-full w-full" aria-hidden="true">
      <rect x="35" y="10" width="100" height="130" rx="6" fill="#EEF1EC" stroke="#DCE3DC" strokeWidth="2" />
      <line x1="50" y1="34" x2="120" y2="34" stroke="#93A29D" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="48" x2="120" y2="48" stroke="#DCE3DC" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="60" x2="100" y2="60" stroke="#DCE3DC" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="82" x2="120" y2="82" stroke="#DCE3DC" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="94" x2="90" y2="94" stroke="#DCE3DC" strokeWidth="3" strokeLinecap="round" />
      <circle cx="140" cy="108" r="34" fill="#C1651C" />
      <circle cx="140" cy="108" r="34" fill="none" stroke="#9C5015" strokeWidth="2" strokeDasharray="3 4" />
      <path
        d="M126 108l9 9 20-20"
        fill="none"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
