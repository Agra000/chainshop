"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlignLeft, CheckCircle2, Loader2, MapPin, Save, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { ShopImageUpload } from "@/components/seller/ShopImageUpload";
import { CITIES } from "@/components/seller/SellerRegistrationModal";
import { sellerservice } from "@/services/SellerService";
import { getApiErrorMessage } from "@/lib/axios";
import { deleteImage, uploadImageIfNeeded } from "@/lib/upload";

export default function ShopSettingsPage() {
  const { user, isSeller, hydrated, updateShop } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || (user.storeId !== undefined && !isSeller)) router.replace("/");
  }, [hydrated, user, isSeller, router]);

  useEffect(() => {
    if (!user?.storeId) return;

    async function loadData() {
      const res = await sellerservice.GetSellerInfo(user.storeId);
      setForm({
        shopName: res.shopName || "",
        shopImage: res.shopImage || null,
        shopDescription: res.shopDescription || "",
        city: res.city || "",
      });
    }

    loadData();
  }, [user?.storeId]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shopName.trim()) return;

    setSaving(true);
    let image = { url: "", uploaded: false };
    try {
      // foto baru diupload saat "Save changes". Foto dihapus -> image "" (backend menghapus file lama di storage)
      image = await uploadImageIfNeeded(user.userId, "shops", form.shopImage);
      const res = await sellerservice.UpdateShop(user.storeId, {
        shopName: form.shopName.trim(),
        image: image.url,
        shopDescription: form.shopDescription.trim(),
        city: form.city,
        payoutWalletAddress: "",
      });
      if (!res.status) throw new Error(res.message);

      await updateShop();
      setForm((f) => ({ ...f, shopImage: image.url || null }));
      setDone(true);
    } catch (error) {
      if (image.uploaded) await deleteImage(user.userId, image.url);
      alert(getApiErrorMessage(error, "Failed to save shop info."));
    } finally {
      setSaving(false);
    }
  }

  if (!hydrated || !form) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/seller" />

      {done ? (
        <div className="card mt-4 flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">Shop updated!</h1>
          <p className="max-w-xs text-sm text-ink-soft">
            <span className="font-semibold text-ink">{form.shopName}</span> has been updated.
          </p>
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={() => setDone(false)} className="btn-secondary">
              Keep editing
            </button>
            <Link href="/seller" className="btn-primary">
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 mt-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seal-soft text-seal-dark">
              <Store size={18} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">Edit shop info</h1>
              <p className="text-xs text-ink-faint">Update your shop name, photo, and details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5 sm:p-6">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Store size={12} />
                Shop name
              </label>
              <input
                value={form.shopName}
                onChange={set("shopName")}
                className="input-field"
                required
                maxLength={60}
              />
            </div>

            <ShopImageUpload
              value={form.shopImage}
              onChange={(v) => setForm((f) => ({ ...f, shopImage: v }))}
            />

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <AlignLeft size={12} />
                Shop description
                <span className="ml-auto text-ink-faint">optional</span>
              </label>
              <textarea
                value={form.shopDescription}
                onChange={set("shopDescription")}
                rows={2}
                maxLength={200}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <MapPin size={12} />
                City / location
              </label>
              <select value={form.city} onChange={set("city")} className="input-field bg-surface">
                <option value="" disabled>
                  Select a city…
                </option>
                {[...new Set([form.city, ...CITIES].filter(Boolean))].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-1 flex gap-3">
              <Link href="/seller" className="btn-secondary flex-1">
                Cancel
              </Link>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
