"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Home,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { addressService } from "@/services/AddressService";
import { getApiErrorMessage } from "@/lib/axios";
import { toast } from "@/lib/toast";
import { AddressListSkeleton } from "@/components/ui/Skeleton";

const EMPTY_FORM = {
  label: "",
  recipientName: "",
  phone: "",
  fullAddress: "",
  city: "",
  province: "",
  postalCode: "",
  isDefault: false,
};

const LABEL_PRESETS = ["Rumah", "Kantor", "Kos", "Apartemen"];

function validate(form) {
  const errors = {};
  if (!form.label.trim()) errors.label = "Label alamat wajib diisi.";
  if (!form.recipientName.trim()) errors.recipientName = "Nama penerima wajib diisi.";
  const phoneDigits = form.phone.replace(/[^\d]/g, "");
  if (!phoneDigits) errors.phone = "Nomor telepon wajib diisi.";
  else if (phoneDigits.length < 9 || phoneDigits.length > 15)
    errors.phone = "Nomor telepon harus 9–15 digit.";
  if (form.fullAddress.trim().length < 10)
    errors.fullAddress = "Tulis alamat lengkap (min. 10 karakter).";
  if (!form.city.trim()) errors.city = "Kota wajib diisi.";
  if (!form.province.trim()) errors.province = "Provinsi wajib diisi.";
  if (form.postalCode && !/^\d{5}$/.test(form.postalCode.trim()))
    errors.postalCode = "Kode pos harus 5 digit angka.";
  return errors;
}

function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-ink-soft">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function AddressForm({ initial, saving, onCancel, onSubmit, isFirst }) {
  // nilai null dari API dijadikan string kosong supaya input tetap controlled
  const [form, setForm] = useState(() => {
    const merged = { ...EMPTY_FORM };
    for (const key of Object.keys(EMPTY_FORM)) {
      if (initial?.[key] !== undefined && initial[key] !== null) merged[key] = initial[key];
    }
    if (initial?.id) merged.id = initial.id;
    merged.postalCode = String(merged.postalCode);
    return merged;
  });
  const [errors, setErrors] = useState({});

  function set(field) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.warning("Periksa lagi data alamat yang belum valid.");
      return;
    }
    onSubmit({
      ...form,
      label: form.label.trim(),
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      fullAddress: form.fullAddress.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postalCode: form.postalCode.trim(),
      // alamat pertama otomatis jadi alamat utama
      isDefault: isFirst ? true : form.isDefault,
    });
  }

  const err = (f) => (errors[f] ? "border-danger focus:border-danger" : "");

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="animate-pop-in rounded-xl border border-ledger/30 bg-paper/50 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink">
          {form.id ? "Edit alamat" : "Tambah alamat baru"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Batal"
          className="icon-btn !h-8 !w-8"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Label alamat" error={errors.label} className="sm:col-span-2">
          <input
            value={form.label}
            onChange={set("label")}
            placeholder="mis. Rumah, Kantor"
            className={`input-field ${err("label")}`}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LABEL_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, label: preset }));
                  setErrors((prev) => ({ ...prev, label: undefined }));
                }}
                className={`chip border transition-colors duration-150 ${
                  form.label === preset
                    ? "border-ledger bg-ledger-soft text-ledger-dark"
                    : "border-border bg-surface text-ink-soft hover:border-ink/20"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Nama penerima" error={errors.recipientName}>
          <input
            value={form.recipientName}
            onChange={set("recipientName")}
            placeholder="Nama lengkap penerima"
            autoComplete="name"
            className={`input-field ${err("recipientName")}`}
          />
        </Field>

        <Field label="Nomor telepon" error={errors.phone}>
          <input
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={set("phone")}
            placeholder="08xx-xxxx-xxxx"
            autoComplete="tel"
            className={`input-field ${err("phone")}`}
          />
        </Field>

        <Field label="Alamat lengkap" error={errors.fullAddress} className="sm:col-span-2">
          <textarea
            value={form.fullAddress}
            onChange={set("fullAddress")}
            rows={3}
            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan"
            autoComplete="street-address"
            className={`input-field resize-none ${err("fullAddress")}`}
          />
        </Field>

        <Field label="Kota / Kabupaten" error={errors.city}>
          <input
            value={form.city}
            onChange={set("city")}
            placeholder="mis. Jakarta Selatan"
            autoComplete="address-level2"
            className={`input-field ${err("city")}`}
          />
        </Field>

        <Field label="Provinsi" error={errors.province}>
          <input
            value={form.province}
            onChange={set("province")}
            placeholder="mis. DKI Jakarta"
            autoComplete="address-level1"
            className={`input-field ${err("province")}`}
          />
        </Field>

        <Field label="Kode pos (opsional)" error={errors.postalCode}>
          <input
            inputMode="numeric"
            maxLength={5}
            value={form.postalCode}
            onChange={set("postalCode")}
            placeholder="12345"
            autoComplete="postal-code"
            className={`input-field ${err("postalCode")}`}
          />
        </Field>

        <label
          className={`flex items-center gap-2 self-end pb-2.5 text-sm ${
            isFirst ? "text-ink-faint" : "cursor-pointer text-ink-soft"
          }`}
        >
          <input
            type="checkbox"
            checked={isFirst || form.isDefault}
            onChange={set("isDefault")}
            disabled={isFirst}
            className="h-4 w-4 accent-ledger"
          />
          Jadikan alamat utama
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {saving ? "Menyimpan…" : "Simpan alamat"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} className="btn-ghost">
          Batal
        </button>
      </div>
    </form>
  );
}

function AddressCard({ address, busy, onEdit, onDelete, onSetDefault }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 transition-colors duration-150 ${
        address.isDefault ? "border-ledger/40 bg-ledger-soft/30" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Home size={14} className="text-ink-soft" />
        <span className="text-sm font-semibold text-ink">{address.label || "Alamat"}</span>
        {address.isDefault && (
          <span className="chip !py-0.5 border border-ledger/20 bg-ledger-soft text-ledger-dark">
            <Star size={11} className="fill-current" />
            Utama
          </span>
        )}
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-sm text-ink">
        <User size={13} className="text-ink-faint" />
        {address.recipientName}
        <span className="text-ink-faint">·</span>
        <Phone size={13} className="text-ink-faint" />
        <span className="text-ink-soft">{address.phone}</span>
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-soft">
        <MapPin size={13} className="mt-0.5 shrink-0 text-ink-faint" />
        <span>
          {address.fullAddress}, {address.city}
          {address.province ? `, ${address.province}` : ""}
          {address.postalCode ? ` ${address.postalCode}` : ""}
        </span>
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        {confirmDelete ? (
          <>
            <span className="mr-1 text-xs text-ink-soft">Hapus alamat ini?</span>
            <button
              type="button"
              onClick={() => onDelete(address)}
              disabled={busy}
              className="btn-danger-ghost !px-3 !py-1.5 !text-xs"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Ya, hapus
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={busy}
              className="btn-ghost !px-3 !py-1.5 !text-xs"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(address)}
              disabled={busy}
              className="btn-ghost !px-3 !py-1.5 !text-xs"
            >
              <Pencil size={13} />
              Edit
            </button>
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => onSetDefault(address)}
                disabled={busy}
                className="btn-ghost !px-3 !py-1.5 !text-xs"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} />}
                Jadikan utama
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="btn-danger-ghost ml-auto !px-3 !py-1.5 !text-xs"
            >
              <Trash2 size={13} />
              Hapus
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Kelola alamat pengiriman user (MsAddresses) dari halaman Profile.
 * Alamat yang disimpan di sini langsung bisa dipilih saat checkout.
 */
export function AddressBook({ userId }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {} (baru) | address
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await addressService.GetAddresses(userId);
      const data = res.data || [];
      // alamat utama selalu di paling atas
      setAddresses([...data].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal memuat daftar alamat."));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  async function handleSubmit(data) {
    setSaving(true);
    try {
      const res = await addressService.UpsertAddress(userId, data);
      if (!res.status) {
        toast.error(res.message || "Gagal menyimpan alamat.");
        return;
      }
      toast.success(data.id ? "Alamat berhasil diperbarui." : "Alamat baru berhasil ditambahkan.");
      setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal menyimpan alamat."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(address) {
    setBusyId(address.id);
    try {
      const res = await addressService.SetDefaultAddress(userId, address.id);
      if (!res.status) {
        toast.error(res.message || "Gagal mengubah alamat utama.");
        return;
      }
      toast.success(`"${address.label}" sekarang jadi alamat utama.`);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal mengubah alamat utama."));
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(address) {
    setBusyId(address.id);
    try {
      const res = await addressService.DeleteAddress(userId, address.id);
      if (!res.status) {
        toast.error(res.message || "Gagal menghapus alamat.");
        return;
      }
      toast.success("Alamat berhasil dihapus.");
      if (editing?.id === address.id) setEditing(null);
      await load();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Gagal menghapus alamat."));
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 font-display text-base font-semibold text-ink">
            <MapPin size={17} className="text-ink-soft" />
            Alamat pengiriman
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Alamat utama otomatis dipilih saat checkout.
          </p>
        </div>
        {!editing && !loading && (
          <button
            type="button"
            onClick={() => setEditing({})}
            className="btn-secondary !px-4 !py-2"
          >
            <Plus size={16} />
            Tambah alamat
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {editing && (
          <AddressForm
            key={editing.id || "new"}
            initial={editing}
            saving={saving}
            isFirst={addresses.length === 0 || (addresses.length === 1 && editing.id === addresses[0].id)}
            onCancel={() => setEditing(null)}
            onSubmit={handleSubmit}
          />
        )}

        {loading ? (
          <AddressListSkeleton />
        ) : addresses.length === 0 && !editing ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink-soft">
              <MapPin size={20} />
            </span>
            <p className="text-sm font-medium text-ink">Belum ada alamat tersimpan</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Tambahkan alamat supaya checkout berikutnya lebih cepat.
            </p>
            <button
              type="button"
              onClick={() => setEditing({})}
              className="btn-primary mt-2 !px-4 !py-2"
            >
              <Plus size={16} />
              Tambah alamat
            </button>
          </div>
        ) : (
          addresses
            .filter((a) => a.id !== editing?.id)
            .map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                busy={busyId === a.id}
                onEdit={(addr) => setEditing(addr)}
                onDelete={handleDelete}
                onSetDefault={handleSetDefault}
              />
            ))
        )}
      </div>
    </section>
  );
}
