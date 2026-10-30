// Toast global berbasis event, jadi bisa dipanggil dari mana saja
// (komponen, context, service) tanpa hook. <Toaster /> yang menampilkannya.
//
//   toast.success("Tersimpan");
//   toast.error("Gagal menyimpan alamat");
//   toast.warning("Tambahkan alamat dulu");
//   toast.info("Pesanan diproses", { duration: 5000 });

export const TOAST_EVENT = "chainshop:toast";

const DEFAULT_DURATION = 3200;

function emit(type, message, options = {}) {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        message: String(message),
        title: options.title,
        duration: options.duration ?? DEFAULT_DURATION,
      },
    }),
  );
}

export const toast = {
  success: (message, options) => emit("success", message, options),
  error: (message, options) => emit("error", message, options),
  warning: (message, options) => emit("warning", message, options),
  info: (message, options) => emit("info", message, options),
};
