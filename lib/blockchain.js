import { generateTxHash } from "@/lib/format";

// Alamat smart contract escrow. Selama belum di-set, aplikasi jalan di
// "demo mode": tx hash di-generate di browser supaya alur tetap bisa dicoba.
const ESCROW_CONTRACT = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "";

export function isOnchainEnabled() {
  return !!ESCROW_CONTRACT && typeof window !== "undefined" && !!window.ethereum;
}

async function getConnectedWallet() {
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

function toHex(text) {
  return `0x${Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}`;
}

// Kirim transaksi ke contract escrow lewat MetaMask dan kembalikan tx hash-nya.
// TODO: ganti `data` dengan encode function call ABI contract escrow asli
// (mis. pakai ethers/viem) begitu contract sudah di-deploy.
async function sendEscrowTx(data, fallbackWallet) {
  if (!isOnchainEnabled()) {
    return { txHash: generateTxHash(), walletAddress: fallbackWallet || null, demo: true };
  }

  const from = await getConnectedWallet();
  const txHash = await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [{ from, to: ESCROW_CONTRACT, value: "0x0", data }],
  });

  return { txHash, walletAddress: from, demo: false };
}

// Buyer membayar -> dana ditahan di escrow
export function holdEscrow(order, wallet) {
  return sendEscrowTx(toHex(`HOLD|${order.orderCode}|${order.totalIdr}`), wallet);
}

// Buyer konfirmasi barang diterima -> dana dilepas ke seller
export function releaseEscrow(order, wallet) {
  return sendEscrowTx(toHex(`RELEASE|${order.orderCode}|${order.totalIdr}`), wallet);
}

// Seller menolak order -> dana dikembalikan ke buyer
export function refundEscrow(order, wallet) {
  return sendEscrowTx(toHex(`REFUND|${order.orderCode}|${order.totalIdr}`), wallet);
}

// Seller menyimpan hash invoice pengiriman ke onchain (bukti isi paket)
export function recordInvoice(invoiceHash, wallet) {
  return sendEscrowTx(invoiceHash, wallet);
}
