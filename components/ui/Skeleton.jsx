/**
 * Loading placeholders shown while data is fetched from the backend.
 * Bentuknya meniru layout aslinya supaya halaman tidak "loncat" saat data datang.
 */
export function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`skeleton rounded-lg ${className}`} />;
}

function SrOnly({ children }) {
  return <span className="sr-only">{children}</span>;
}

function PageHeaderSkeleton({ titleWidth = "w-40" }) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <Skeleton className="h-8 w-20 !rounded-full" />
      <Skeleton className={`h-6 ${titleWidth}`} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 10 }) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-square w-full !rounded-none" />
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="mt-1 h-4 w-1/3" />
            <div className="mt-1 flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 p-4">
          <Skeleton className="h-14 w-14 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 4 }) {
  return (
    <div role="status" aria-label="Loading form" className="card flex flex-col gap-4 p-5 sm:p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="mt-1 h-10 w-full" />
    </div>
  );
}

export function SellerDashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="grid gap-5 md:grid-cols-[280px_1fr] md:items-start">
      <div className="card overflow-hidden">
        <Skeleton className="h-28 w-full !rounded-none" />
        <div className="flex flex-col items-center gap-3 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-52" />
          <Skeleton className="h-3 w-36" />
          <Skeleton className="mt-2 h-8 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-2 px-4 py-3.5">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <ListSkeleton count={3} />
      </div>
    </div>
  );
}

/** Halaman detail produk: galeri + info + tombol + deskripsi. */
export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <SrOnly>Memuat produk…</SrOnly>
      <Skeleton className="h-8 w-20 !rounded-full" />

      <div className="mt-2 grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full !rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 !rounded-xl" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-4/5" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="mt-1 h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-8 w-64 !rounded-full" />
          <Skeleton className="h-12 w-full !rounded-xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-28 !rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Skeleton className="h-11 flex-1 !rounded-full" />
            <Skeleton className="h-11 flex-1 !rounded-full" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="card flex flex-col gap-2.5 p-5 sm:p-6">
          <Skeleton className="mb-1 h-5 w-28" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
        <div className="card flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="mb-1 h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Halaman daftar pesanan (transaksi / riwayat). */
export function OrderListPageSkeleton({ withStats = false, count = 3 }) {
  return (
    <div role="status" aria-label="Loading orders" className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <SrOnly>Memuat pesanan…</SrOnly>
      <PageHeaderSkeleton titleWidth="w-48" />
      {withStats && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-sm">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card flex flex-col gap-2 px-4 py-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-6 w-24 !rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 shrink-0 !rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-28 !rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Halaman detail pesanan (buyer & seller). */
export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading order" className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <SrOnly>Memuat detail pesanan…</SrOnly>
      <PageHeaderSkeleton titleWidth="w-56" />
      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div className="card flex flex-col gap-4 p-5 sm:p-6">
          <Skeleton className="h-5 w-36" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 shrink-0 !rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="card flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 shrink-0 !rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
          <div className="my-1 h-px bg-border" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
          <Skeleton className="mt-2 h-11 w-full !rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Isi halaman cart (satu kartu berisi daftar item). */
export function CartSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-label="Loading cart" className="card p-4 sm:p-5">
      <SrOnly>Memuat keranjang…</SrOnly>
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Skeleton className="h-[18px] w-[18px] !rounded" />
        <Skeleton className="h-4 w-28" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-border py-4 last:border-b-0 sm:gap-4">
          <Skeleton className="h-[18px] w-[18px] shrink-0 !rounded" />
          <Skeleton className="h-16 w-16 shrink-0 !rounded-xl sm:h-20 sm:w-20" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-7 w-20 !rounded-full" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Halaman payment. */
export function PaymentSkeleton() {
  return (
    <div role="status" aria-label="Loading payment" className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <SrOnly>Memuat pembayaran…</SrOnly>
      <PageHeaderSkeleton titleWidth="w-32" />
      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-start">
        <div className="card flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 shrink-0 !rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full !rounded-xl" />
          </div>
        </div>
        <div className="card flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
          <Skeleton className="h-12 w-full !rounded-xl" />
          <Skeleton className="mt-2 h-11 w-full !rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Halaman profile: kartu identitas + form. */
export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <SrOnly>Memuat profil…</SrOnly>
      <PageHeaderSkeleton titleWidth="w-24" />
      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-start">
        <div className="card flex flex-col items-center gap-3 p-6">
          <Skeleton className="h-[72px] w-[72px] !rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-40 !rounded-full" />
          <Skeleton className="mt-2 h-14 w-full !rounded-xl" />
        </div>
        <div className="flex flex-col gap-5">
          <FormSkeleton fields={4} />
          <AddressListSkeleton />
        </div>
      </div>
    </div>
  );
}

/** Daftar alamat di halaman profile. */
export function AddressListSkeleton({ count = 2 }) {
  return (
    <div role="status" aria-label="Loading addresses" className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-14 !rounded-full" />
          </div>
          <Skeleton className="mt-3 h-3.5 w-2/5" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
