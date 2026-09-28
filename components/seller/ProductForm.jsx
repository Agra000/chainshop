"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Package,
  Tag,
  Banknote,
  Boxes,
  AlignLeft,
  ImagePlus,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { categories } from "@/data/categories";
import { formatIDR } from "@/lib/format";

const PRODUCT_CATEGORIES = categories.filter((c) => c.slug !== "all");

export const EMPTY_PRODUCT_FORM = {
  name: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  image: null,
};

/** Required image upload field — blocks submit until a file is chosen. */
function ProductImageUpload({ value, onChange, error }) {
  const inputRef = useRef(null);
  const [warn, setWarn] = useState(false);

  function readFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setWarn(file.size > 400 * 1024);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  function handleFile(e) {
    readFile(e.target.files?.[0]);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    readFile(e.dataTransfer.files?.[0]);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
    setWarn(false);
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <ImagePlus size={12} />
        Product photo
        <span className="ml-auto text-danger">required</span>
      </label>

      <div
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex min-h-[140px] w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          value
            ? "border-border"
            : error
            ? "cursor-pointer border-dashed border-danger/50 bg-danger-soft/30 hover:border-danger"
            : "cursor-pointer border-dashed border-border hover:border-seal hover:bg-seal-soft/30"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Product preview"
              className="h-full max-h-56 w-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/30 opacity-0 transition-opacity duration-200 hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow transition-all hover:bg-paper active:scale-95"
              >
                <ImagePlus size={13} />
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white shadow transition-all hover:bg-danger-dark active:scale-95"
              >
                <X size={13} />
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
              <ImagePlus size={20} className="text-ink-faint" />
            </div>
            <p className="text-xs font-medium text-ink-soft">
              Click or drag & drop an image
            </p>
            <p className="text-[11px] text-ink-faint">
              JPG, PNG or WebP · best at 1:1 ratio
            </p>
          </div>
        )}
      </div>

      {warn && (
        <p className="mt-1 text-[11px] text-seal-dark">
          Large image — consider compressing it first so it fits in local
          storage. Swap for a proper upload endpoint in production.
        </p>
      )}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
          <AlertCircle size={11} />
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/**
 * Shared name/category/price/stock/description/image form used to both
 * create a new product and edit an existing one. Every field is required —
 * `onSubmit` only fires once all of them pass validation.
 */
export function ProductForm({
  initialValues = EMPTY_PRODUCT_FORM,
  onSubmit,
  submitLabel,
  submitPendingLabel = "Saving…",
  submitIcon: SubmitIcon,
  cancelHref,
}) {
  const [form, setForm] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(field) {
    return (e) => {
      const val = e?.target ? e.target.value : e;
      setForm((f) => ({ ...f, [field]: val }));
      setErrors((err) => ({ ...err, [field]: undefined }));
    };
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Product name is required.";
    if (!form.category) next.category = "Pick a category.";

    const priceNum = Number(form.price);
    if (form.price === "" || Number.isNaN(priceNum) || priceNum <= 0) {
      next.price = "Enter a valid price greater than 0.";
    }

    const stockNum = Number(form.stock);
    if (
      form.stock === "" ||
      Number.isNaN(stockNum) ||
      !Number.isInteger(stockNum) ||
      stockNum < 0
    ) {
      next.stock = "Enter a valid stock quantity.";
    }

    if (!form.description.trim()) next.description = "Description is required.";
    if (!form.image) next.image = "Upload a product photo.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await onSubmit({
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description.trim(),
      images: [form.image],
    });
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card flex flex-col gap-4 p-5 sm:p-6">
      {/* Product name */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <Package size={12} />
          Product name
        </label>
        <input
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Nimbus X13 Smartphone 256GB"
          maxLength={120}
          className={`input-field ${errors.name ? "border-danger focus:border-danger" : ""}`}
        />
        {errors.name && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
            <AlertCircle size={11} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <Tag size={12} />
          Category
        </label>
        <select
          value={form.category}
          onChange={set("category")}
          className={`input-field bg-surface ${
            errors.category ? "border-danger focus:border-danger" : ""
          }`}
        >
          <option value="" disabled>
            Select a category…
          </option>
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
            <AlertCircle size={11} />
            {errors.category}
          </p>
        )}
      </div>

      {/* Price + stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <Banknote size={12} />
            Price (IDR)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            inputMode="numeric"
            value={form.price}
            onChange={set("price")}
            placeholder="e.g. 4299000"
            className={`input-field ${errors.price ? "border-danger focus:border-danger" : ""}`}
          />
          {errors.price ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
              <AlertCircle size={11} />
              {errors.price}
            </p>
          ) : (
            form.price !== "" &&
            !Number.isNaN(Number(form.price)) && (
              <p className="mt-1 text-[11px] text-ink-faint">
                ≈ {formatIDR(Number(form.price))}
              </p>
            )
          )}
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <Boxes size={12} />
            Stock
          </label>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={form.stock}
            onChange={set("stock")}
            placeholder="e.g. 48"
            className={`input-field ${errors.stock ? "border-danger focus:border-danger" : ""}`}
          />
          {errors.stock && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
              <AlertCircle size={11} />
              {errors.stock}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
          <AlignLeft size={12} />
          Description
        </label>
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Describe the product's condition, materials, specs..."
          rows={4}
          maxLength={800}
          className={`input-field resize-none ${
            errors.description ? "border-danger focus:border-danger" : ""
          }`}
        />
        {errors.description && (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-danger">
            <AlertCircle size={11} />
            {errors.description}
          </p>
        )}
      </div>

      {/* Image */}
      <ProductImageUpload
        value={form.image}
        onChange={(v) => {
          setForm((f) => ({ ...f, image: v }));
          setErrors((err) => ({ ...err, image: undefined }));
        }}
        error={errors.image}
      />

      <div className="mt-1 flex gap-3">
        {cancelHref && (
          <Link href={cancelHref} className="btn-secondary flex-1">
            Cancel
          </Link>
        )}
        <button type="submit" disabled={submitting} className="btn-primary flex-1">
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {submitPendingLabel}
            </>
          ) : (
            <>
              {SubmitIcon && <SubmitIcon size={16} />}
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
