import { Lock, LockOpen, Undo2 } from "lucide-react";
import { formatDate, formatUSDT } from "@/lib/format";
import { addressUrl } from "@/lib/blockchain";
import { TxLink } from "@/components/common/TxLink";

const TX_LABEL = {
  hold: "Deposit to escrow",
  release: "Released to seller",
  refund: "Refunded to buyer",
};

// status dana di smart contract escrow + riwayat transaksi on-chain
export function EscrowCard({ tx, viewer = "buyer" }) {
  const { escrow } = tx;
  const title = escrow.locked
    ? tx.status === "accepted"
      ? viewer === "seller"
        ? "Buyer accepted, ready for you to claim"
        : "Accepted, waiting for the seller to claim"
      : viewer === "seller"
      ? "Funds locked until the buyer confirms"
      : "Funds locked in the escrow contract"
    : tx.status === "refunded"
      ? "Refunded: items + shipping to buyer, gas estimate to seller"
      : escrow.refunded
        ? "Full payment refunded to buyer"
        : escrow.releaseTxHash
          ? "Funds released to the seller"
          : "Waiting for payment";

  const Icon = escrow.locked ? Lock : escrow.refunded ? Undo2 : LockOpen;
  const escrowUrl = addressUrl(tx.escrowAddress);

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-display text-base font-semibold text-ink">Escrow status</h2>
      <div className="mt-3 flex items-center gap-3 rounded-xl bg-paper/70 px-4 py-3">
        <Icon size={18} className={`shrink-0 ${escrow.locked ? "text-seal" : "text-ledger"}`} />
        <p className="text-sm font-medium text-ink">{title}</p>
      </div>

      {tx.escrowTransactions?.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2 text-xs">
          {tx.escrowTransactions.map((e) => (
            <li key={`${e.txType}-${e.txHash}`} className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-ink">{TX_LABEL[e.txType] || e.txType}</p>
                <p className="text-ink-faint">{formatDate(e.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-ink">{formatUSDT(e.amountIdr, { maxDecimals: 4 })}</p>
                <TxLink hash={e.txHash} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-ink-faint">
        Only money movements (deposit, release, refund) and the invoice are on-chain, on Sepolia testnet (Mock USDT,
        no real money). Delivery, refund requests and returns are tracked by ChainShop without gas.{" "}
        {escrowUrl && (
          <a href={escrowUrl} target="_blank" rel="noreferrer" className="text-seal hover:underline">
            View contract
          </a>
        )}
      </p>
    </section>
  );
}
