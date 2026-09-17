"use client";

import { useState } from "react";
import { Wallet, Mail, Link2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";

export function AuthModal({ open, mode, onClose }) {
  const { login, loginWithWallet } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [connecting, setConnecting] = useState(false);

  const title = mode === "signup" ? "Create your account" : "Log in to ChainShop";

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    login({ name, email });
    setName("");
    setEmail("");
    onClose();
  }

  function handleWalletConnect() {
    setConnecting(true);
    // Simulated wallet handshake — swap for a real wagmi/viem connector later.
    window.setTimeout(() => {
      loginWithWallet();
      setConnecting(false);
      onClose();
    }, 700);
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="auth-modal-title">
      <h2 id="auth-modal-title" className="font-display text-xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        This is a demo account — no real email or wallet is required.
      </p>

      <form onSubmit={handleEmailSubmit} className="mt-5 flex flex-col gap-3">
        <div>
          <label htmlFor="auth-name" className="mb-1 block text-xs font-medium text-ink-soft">
            Name
          </label>
          <input
            id="auth-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sari Dewi"
            className="input-field"
            required
          />
        </div>
        <div>
          <label htmlFor="auth-email" className="mb-1 block text-xs font-medium text-ink-soft">
            Email (optional)
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary mt-1 w-full">
          <Mail size={16} />
          {mode === "signup" ? "Create account" : "Log in"}
        </button>
      </form>

      <div className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-faint">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={handleWalletConnect}
        disabled={connecting}
        className="btn-secondary w-full"
      >
        {connecting ? (
          <>
            <Link2 size={16} className="animate-pulse" />
            Connecting wallet...
          </>
        ) : (
          <>
            <Wallet size={16} />
            Connect a wallet instead
          </>
        )}
      </button>
    </Modal>
  );
}
