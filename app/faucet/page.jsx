"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Droplets, ExternalLink, Fuel, Loader2, PlusCircle, Wallet } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import { useAuth } from "@/context/AuthContext";
import {
  MUSDT_ADDRESS,
  MUSDT_DECIMALS,
  addressUrl,
  claimFaucet,
  getChainErrorMessage,
  getEthBalance,
  getMusdtInfo,
  getWallet,
  isOnchainConfigured,
  txUrl,
} from "@/lib/blockchain";
import { formatCountdown, formatDate, formatUSDT, shortenAddress } from "@/lib/format";
import { toast } from "@/lib/toast";

const SEPOLIA_ETH_FAUCETS = [
  { label: "Google Cloud Web3 faucet", href: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
  { label: "Alchemy Sepolia faucet", href: "https://www.alchemy.com/faucets/ethereum-sepolia" },
];

export default function FaucetPage() {
  const router = useRouter();
  const { isLoggedIn, hydrated } = useAuth();

  // lapis kedua selain middleware: sesi habis / logout saat halaman terbuka -> keluar dari faucet
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace("/");
  }, [hydrated, isLoggedIn, router]);

  const [account, setAccount] = useState("");
  const [info, setInfo] = useState(null);
  const [eth, setEth] = useState(null);
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState("");

  async function load(address = account) {
    if (!address) return;
    const [musdt, ethBalance] = await Promise.all([getMusdtInfo(address), getEthBalance(address)]);
    setInfo(musdt);
    setEth(ethBalance);
  }

  async function connect() {
    try {
      const { account: acc } = await getWallet();
      setAccount(acc);
      await load(acc);
    } catch (error) {
      toast.error(getChainErrorMessage(error, "Failed to connect MetaMask."));
    }
  }

  useEffect(() => {
    if (!isOnchainConfigured() || typeof window === "undefined" || !window.ethereum) return;
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => accounts?.[0] && connect())
      .catch(() => {});
  }, []);

  async function handleClaim() {
    setBusy(true);
    try {
      const res = await claimFaucet();
      setLastTx(res.txHash);
      toast.success("10,000 mUSDT added to your wallet.");
      await load(res.walletAddress);
    } catch (error) {
      toast.error(getChainErrorMessage(error, "Faucet claim failed."));
    } finally {
      setBusy(false);
    }
  }

  async function handleAddToken() {
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: { type: "ERC20", options: { address: MUSDT_ADDRESS, symbol: "mUSDT", decimals: MUSDT_DECIMALS } },
      });
    } catch (error) {
      toast.error(getChainErrorMessage(error, "Failed to add token."));
    }
  }

  const cooldown = info?.nextFaucetAt && info.nextFaucetAt > Date.now();

  if (!hydrated || !isLoggedIn) return null;

  return (
    <div className="mx-auto max-w-xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-1 mt-1 font-display text-xl font-semibold text-ink">mUSDT Faucet</h1>
      <p className="mb-5 text-sm text-ink-soft">
        ChainShop runs on the <strong>Sepolia testnet</strong> with Mock USDT (mUSDT). These tokens have no value and no
        real money is involved. Anyone can claim 10,000 mUSDT once every 24 hours.
      </p>

      {!isOnchainConfigured() ? (
        <div className="card p-5 text-sm text-danger">
          Contract addresses are not configured. Set NEXT_PUBLIC_MUSDT_ADDRESS and NEXT_PUBLIC_ESCROW_ADDRESS in .env.local.
        </div>
      ) : (
        <section className="card p-5 sm:p-6">
          {!account ? (
            <button type="button" onClick={connect} className="btn-primary w-full">
              <Wallet size={17} />
              Connect MetaMask
            </button>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm text-ink">
                <Wallet size={16} className="text-ink-soft" />
                <span className="font-mono">{shortenAddress(account, 6)}</span>
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-paper/70 px-4 py-3">
                  <p className="flex items-center gap-1 text-xs text-ink-faint">
                    <Coins size={13} />
                    mUSDT balance
                  </p>
                  <p className="font-display text-lg font-semibold text-ink">{info ? formatUSDT(info.balance) : "…"}</p>
                </div>
                <div className="rounded-xl bg-paper/70 px-4 py-3">
                  <p className="flex items-center gap-1 text-xs text-ink-faint">
                    <Fuel size={13} />
                    Sepolia ETH (gas)
                  </p>
                  <p className="font-display text-lg font-semibold text-ink">{eth === null ? "…" : eth.toFixed(4)}</p>
                </div>
              </div>

              <button type="button" onClick={handleClaim} disabled={busy || cooldown} className="btn-primary mt-4 w-full">
                {busy ? <Loader2 size={17} className="animate-spin" /> : <Droplets size={17} />}
                {cooldown ? `Next claim in ${formatCountdown(info.nextFaucetAt)}` : "Claim 10,000 mUSDT"}
              </button>
              {cooldown && (
                <p className="mt-1 text-center text-xs text-ink-faint">Available again {formatDate(new Date(info.nextFaucetAt))}</p>
              )}
              {lastTx && (
                <a
                  href={txUrl(lastTx) || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-1 text-xs text-seal hover:underline"
                >
                  View claim transaction <ExternalLink size={11} />
                </a>
              )}

              <button type="button" onClick={handleAddToken} className="btn-secondary mt-3 w-full !py-2 text-xs">
                <PlusCircle size={14} />
                Add mUSDT to MetaMask
              </button>
            </>
          )}

          <div className="mt-5 border-t border-border pt-4 text-xs text-ink-soft">
            <p className="font-medium text-ink">Need Sepolia ETH for gas?</p>
            <ul className="mt-1 flex flex-col gap-1">
              {SEPOLIA_ETH_FAUCETS.map((f) => (
                <li key={f.href}>
                  <a href={f.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-seal hover:underline">
                    {f.label} <ExternalLink size={11} />
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={addressUrl(MUSDT_ADDRESS) || "#"}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-ink-faint hover:underline"
            >
              mUSDT contract {shortenAddress(MUSDT_ADDRESS)} <ExternalLink size={11} />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
