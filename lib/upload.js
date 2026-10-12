import { uploadService } from "@/services/UploadService";
import { getApiErrorMessage } from "@/lib/axios";

const MAX_SIZE = 5 * 1024 * 1024;

function validate(userId, file) {
  if (!userId) throw new Error("Please log in before uploading images.");
  if (!file || !file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_SIZE) throw new Error("Image must be 5 MB or less.");
}

// data URL (hasil preview FileReader) -> File
function dataUrlToFile(dataUrl, name = "image") {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] || "image/png";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const ext = mime.split("/")[1] || "png";
  return new File([bytes], `${name}.${ext}`, { type: mime });
}

export function isLocalPreview(value) {
  return typeof value === "string" && value.startsWith("data:");
}

/** Create: upload 1 file gambar, kembalikan URL publiknya. */
export async function uploadImage(userId, folder, file) {
  validate(userId, file);
  try {
    const res = await uploadService.UploadImage(userId, folder, file);
    if (!res.status || !res.url) throw new Error(res.message || "Upload failed.");
    return res.url;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Upload failed."));
  }
}

/** Update: upload file baru dan hapus file lama di storage. */
export async function replaceImage(userId, folder, file, oldUrl) {
  validate(userId, file);
  try {
    const res = await uploadService.ReplaceImage(userId, folder, file, oldUrl);
    if (!res.status || !res.url) throw new Error(res.message || "Upload failed.");
    return res.url;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Upload failed."));
  }
}

/** Delete: hapus gambar dari storage. Tidak melempar error (dipakai untuk bersih-bersih). */
export async function deleteImage(userId, url) {
  if (!userId || !url || isLocalPreview(url)) return false;
  try {
    const res = await uploadService.DeleteImage(userId, url);
    return !!res.status;
  } catch (error) {
    return false;
  }
}

/**
 * Dipanggil saat form disubmit. Jika value masih preview lokal (data URL), upload ke
 * storage dan kembalikan URL publiknya. Jika sudah URL (gambar lama) atau kosong,
 * dikembalikan apa adanya tanpa upload ulang.
 * `uploaded` = true jika barusan diupload (supaya bisa dihapus lagi kalau simpan gagal).
 */
export async function uploadImageIfNeeded(userId, folder, value) {
  if (!isLocalPreview(value)) return { url: value || "", uploaded: false };
  const url = await uploadImage(userId, folder, dataUrlToFile(value, folder));
  return { url, uploaded: true };
}
