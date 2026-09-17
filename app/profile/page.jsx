"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Mail, ShieldCheck, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { Avatar } from "@/components/common/Avatar";
import { formatDate, shortenAddress } from "@/lib/format";

export default function ProfilePage() {
  const { user, hydrated, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton />
        <div className="mt-3">
          <EmptyState
            icon={<Wallet size={26} />}
            title="You're not logged in"
            description="Log in from the navbar to view and edit your ChainShop profile."
            actionLabel="Go to homepage"
            actionHref="/"
          />
        </div>
      </div>
    );
  }

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSave(e) {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(user.walletAddress).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Profile</h1>

      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-start">
        {/* left: identity card */}
        <section className="card flex flex-col items-center gap-3 p-6 text-center">
          <Avatar name={user.name} seed={user.walletAddress} size={72} />
          <div>
            <p className="font-display text-base font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-ink-faint">
              {user.authMethod === "wallet" ? "Wallet account" : "Email account"}
            </p>
          </div>

          <span className="chip border border-ledger/20 bg-ledger-soft text-ledger-dark">
            <ShieldCheck size={13} />
            Member since {formatDate(user.joinedAt)}
          </span>

          <div className="mt-2 w-full rounded-xl border border-border bg-paper/60 p-3 text-left">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
              <Wallet size={13} />
              Linked wallet
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-mono text-xs text-ink">
                {shortenAddress(user.walletAddress, 6)}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy wallet address"
                className="icon-btn !h-7 !w-7 shrink-0"
              >
                {copied ? <Check size={14} className="text-ledger" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </section>

        {/* right: editable details */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Personal information
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Used for order confirmations and delivery — nothing here is shared publicly.
          </p>

          <form onSubmit={handleSave} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Full name</label>
              <input
                value={form.name}
                onChange={handleChange("name")}
                className="input-field"
                required
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-ink-soft">
                <Mail size={12} /> Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Phone number</label>
              <input
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="08xx-xxxx-xxxx"
                className="input-field"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="mb-1 block text-xs font-medium text-ink-soft">City</label>
              <input
                value={form.address}
                onChange={handleChange("address")}
                placeholder="e.g. Jakarta Selatan"
                className="input-field"
              />
            </div>

            <div className="flex items-center gap-3 pt-1 sm:col-span-2">
              <button type="submit" className="btn-primary">
                {saved ? <Check size={16} /> : null}
                {saved ? "Saved" : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
