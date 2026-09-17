"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Wallet } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BackButton } from "@/components/ui/BackButton";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { EmptyState } from "@/components/common/EmptyState";
import { formatIDR } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const { items, selectAll, selectedItems, selectedCount, selectedSubtotal } = useCart();

  const allSelected = items.length > 0 && selectedItems.length === items.length;

  function handleProceed() {
    if (selectedItems.length === 0) return;
    router.push("/payment");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 pb-32 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={26} />}
          title="Your cart is empty"
          description="Items you add will show up here, ready for checkout."
          actionLabel="Start shopping"
          actionHref="/"
        />
      ) : (
        <div className="card p-4 sm:p-5">
          <label className="flex items-center gap-3 border-b border-border pb-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => selectAll(e.target.checked)}
              className="h-[18px] w-[18px] accent-ledger"
            />
            Select all ({items.length} item{items.length > 1 ? "s" : ""})
          </label>
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs text-ink-faint">
                Total ({selectedCount} item{selectedCount !== 1 ? "s" : ""})
              </p>
              <p className="font-display text-lg font-bold text-ink sm:text-xl">
                {formatIDR(selectedSubtotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleProceed}
              disabled={selectedItems.length === 0}
              className="btn-primary !px-6"
            >
              <Wallet size={17} />
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
