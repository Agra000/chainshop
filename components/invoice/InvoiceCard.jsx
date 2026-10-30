"use client";

import { useState } from "react";
import { Copy, ExternalLink, FileCheck2, Loader2, ReceiptText } from "lucide-react";
import { orderService } from "@/services/OrderService";
import { getApiErrorMessage } from "@/lib/axios";
import { txUrl } from "@/lib/blockchain";
import { formatDate, formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";
import { toast } from "@/lib/toast";

/**
 * Invoice yang tercatat on-chain (event InvoiceRecorded) saat seller klik "Ship & record invoice".
 * Tx hash-nya = ID transaksi invoice, dipakai buyer saat mengajukan refund.
 */
export function InvoiceCard({ tx }) {
  const [verifying, setVerifying] = useState(false);
  const [verify, setVerify] = useState(null);

  if (!tx.invoiceTxHash) return null;
  const url = txUrl(tx.invoiceTxHash);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tx.invoiceTxHash);
      toast.success("Invoice transaction ID copied");
    } catch (e) {
      toast.error("Failed to copy");
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      setVerify(await orderService.VerifyInvoice(tx.id, tx.invoiceHash));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <ReceiptText size={17} className="text-ink-soft" />
          On-chain invoice
        </h2>
        <span className="chip bg-ledger-soft text-ledger-dark">{tx.invoiceId}</span>
      </div>

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
        <dt className="text-ink-faint">Seller</dt>
        <dd className="truncate text-right font-mono text-ink">{shortenAddress(tx.sellerWallet, 6)}</dd>
        <dt className="text-ink-faint">Buyer</dt>
        <dd className="truncate text-right font-mono text-ink">{shortenAddress(tx.buyerWallet, 6) || "-"}</dd>
        <dt className="text-ink-faint">Purchased</dt>
        <dd className="text-right text-ink">{formatDate(tx.paidAt)}</dd>
        <dt className="text-ink-faint">Shipped</dt>
        <dd className="text-right text-ink">{formatDate(tx.shippedAt)}</dd>
        <dt className="text-ink-faint">Courier</dt>
        <dd className="text-right text-ink">
          {tx.courier.name} · <span className="font-mono">{tx.courier.trackingNumber}</span>
        </dd>
      </dl>

      <table className="mt-4 w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-ink-faint">
            <th className="pb-1.5 font-medium">Item</th>
            <th className="pb-1.5 text-right font-medium">Qty</th>
            <th className="pb-1.5 text-right font-medium">Price</th>
            <th className="pb-1.5 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {tx.items.map((it) => (
            <tr key={it.orderItemId} className="border-b border-border/60 last:border-0">
              <td className="py-1.5 pr-2 text-ink">{it.name}</td>
              <td className="py-1.5 text-right text-ink">{it.qty}</td>
              <td className="py-1.5 text-right text-ink">{formatUSDT(it.price)}</td>
              <td className="py-1.5 text-right text-ink">{formatUSDT(it.lineTotal ?? it.qty * it.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-xs">
        <div className="flex justify-between text-ink-soft">
          <dt>Items total</dt>
          <dd>{formatUSDT(tx.itemsTotal)}</dd>
        </div>
        <div className="flex justify-between text-ink-soft">
          <dt>Shipping fee</dt>
          <dd>{formatUSDT(tx.shippingFee)}</dd>
        </div>
        <div className="flex justify-between text-ink-soft">
          <dt>Gas estimate (paid to seller)</dt>
          <dd>{formatGasEstimate(tx.gasFee)}</dd>
        </div>
        <div className="flex justify-between pt-1 text-sm font-medium text-ink">
          <dt>Total paid</dt>
          <dd>{formatUSDT(tx.total, { maxDecimals: 4 })}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl bg-paper/70 px-3.5 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">Invoice transaction ID</p>
        <p className="mt-1 break-all font-mono text-xs text-ink">{tx.invoiceTxHash}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={handleCopy} className="btn-secondary !px-3 !py-1.5 text-xs">
            <Copy size={13} />
            Copy
          </button>
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="btn-secondary !px-3 !py-1.5 text-xs">
              <ExternalLink size={13} />
              View on Etherscan
            </a>
          )}
          <button type="button" onClick={handleVerify} disabled={verifying} className="btn-secondary !px-3 !py-1.5 text-xs">
            {verifying ? <Loader2 size={13} className="animate-spin" /> : <FileCheck2 size={13} />}
            Verify
          </button>
        </div>
        {verify && (
          <p className={`mt-2 text-xs ${verify.isMatch ? "text-ledger-dark" : "text-danger"}`}>{verify.message}</p>
        )}
      </div>
    </section>
  );
}
