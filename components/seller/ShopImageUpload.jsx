import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export function ShopImageUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [warn, setWarn] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWarn(file.size > 400 * 1024);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    // reset input so re-selecting the same file still fires onChange
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setWarn(file.size > 400 * 1024);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
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
        Shop photo
        <span className="ml-auto text-ink-faint">optional</span>
      </label>

      {/* drop zone / preview */}
      <div
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          value
            ? "border-border"
            : "cursor-pointer border-dashed border-border hover:border-ledger hover:bg-ledger-soft/30"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Shop preview"
              className="h-full max-h-48 w-full object-cover"
            />
            {/* overlay buttons */}
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
