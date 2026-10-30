import { ExternalLink } from "lucide-react";
import { txUrl } from "@/lib/blockchain";
import { shortenAddress } from "@/lib/format";

// tx hash yang bisa diklik ke sepolia.etherscan.io
export function TxLink({ hash, chars = 6, className = "" }) {
  const url = txUrl(hash);
  if (!hash) return <span className={className}>-</span>;
  if (!url) return <span className={`font-mono ${className}`}>{shortenAddress(hash, chars)}</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-1 font-mono text-seal hover:underline ${className}`}
    >
      {shortenAddress(hash, chars)}
      <ExternalLink size={11} />
    </a>
  );
}
