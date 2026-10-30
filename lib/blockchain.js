import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  getAddress,
  http,
} from "viem";
import { hardhat, sepolia } from "viem/chains";
import { ESCROW_ABI, MUSDT_ABI } from "@/lib/contracts";

// ===== konfigurasi (isi .env.local dari output chainshop-contracts/scripts/deploy.js) =====
// Semua berjalan di Sepolia testnet dengan Mock USDT (mUSDT) — tidak ada uang asli.
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);
export const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "";
export const MUSDT_ADDRESS = process.env.NEXT_PUBLIC_MUSDT_ADDRESS || "";
export const EXPLORER_URL = (process.env.NEXT_PUBLIC_EXPLORER_URL || "https://sepolia.etherscan.io").replace(/\/$/, "");
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || (CHAIN_ID === 31337 ? "http://127.0.0.1:8545" : "https://ethereum-sepolia-rpc.publicnode.com");
const CHAIN = CHAIN_ID === 31337 ? hardhat : sepolia;

export const MUSDT_DECIMALS = 6;

// urutan sama dengan enum Status di ChainShopEscrow.sol (v2: hanya status uang, sisanya di backend)
export const ONCHAIN_STATUS = ["None", "Funded", "Shipped", "Completed", "Refunded", "Cancelled"];

export function isOnchainConfigured() {
  return !!ESCROW_ADDRESS && !!MUSDT_ADDRESS;
}

export function txUrl(hash) {
  return hash && /^0x[0-9a-fA-F]{64}$/.test(hash) ? `${EXPLORER_URL}/tx/${hash}` : null;
}

export function addressUrl(address) {
  return address ? `${EXPLORER_URL}/address/${address}` : null;
}

export const publicClient = createPublicClient({ chain: CHAIN, transport: http(RPC_URL) });

function assertConfigured() {
  if (!isOnchainConfigured()) {
    throw new Error("Smart contract belum dikonfigurasi (NEXT_PUBLIC_ESCROW_ADDRESS / NEXT_PUBLIC_MUSDT_ADDRESS).");
  }
}

// pesan error yang bisa dibaca user (MetaMask ditolak, revert contract, dll.)
export function getChainErrorMessage(error, fallback = "Blockchain transaction failed.") {
  if (!error) return fallback;
  // error dari API backend (axios)
  if (error?.response?.data?.message) return error.response.data.message;
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) return "Transaksi dibatalkan di MetaMask.";
    const revert = error.walk((e) => e instanceof ContractFunctionRevertedError);
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName;
      const messages = {
        DeadlinePassed: "Batas waktu untuk aksi ini sudah lewat.",
        DeadlineNotPassed: "Batas waktu belum lewat.",
        NotAllowed: "Wallet ini tidak berhak melakukan aksi tersebut untuk order ini.",
        NotSeller: "Wallet ini bukan seller order tersebut.",
        InvoiceMismatch: "Isi invoice tidak cocok dengan dana di escrow.",
        GasFeeTooHigh: "Estimasi gas berubah, muat ulang halaman lalu coba lagi.",
        OrderExists: "Order ini sudah dibayar.",
        FaucetCooldown: "Faucet hanya bisa diklaim 1x per 24 jam.",
        ERC20InsufficientBalance: "Saldo mUSDT tidak cukup. Klaim dulu di halaman Faucet.",
        AccessControlUnauthorizedAccount: "Wallet ini tidak punya akses admin di smart contract.",
        EnforcedPause: "Escrow sedang di-pause oleh admin.",
        InvalidSignature: "Tanda tangan persetujuan buyer tidak valid untuk order ini.",
        InvalidStatus: "Status order di smart contract sudah berubah. Muat ulang halaman.",
      };
      if (name && messages[name]) return messages[name];
      if (name) return `Transaksi ditolak smart contract (${name}).`;
    }
    return error.shortMessage || error.message || fallback;
  }
  if (error?.code === 4001) return "Transaksi dibatalkan di MetaMask.";
  return error?.message || fallback;
}

async function ensureChain() {
  const hexId = `0x${CHAIN_ID.toString(16)}`;
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current?.toLowerCase() === hexId) return;

  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
  } catch (error) {
    if (error?.code === 4902 && CHAIN_ID === 11155111) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [RPC_URL],
            blockExplorerUrls: [EXPLORER_URL],
          },
        ],
      });
      return;
    }
    throw new Error("Silakan pindahkan jaringan MetaMask ke Sepolia testnet.");
  }
}

// akun MetaMask yang sedang aktif (sudah dipastikan di jaringan yang benar)
export async function getWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask tidak ditemukan. Install ekstensi MetaMask terlebih dahulu.");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  if (!accounts?.length) throw new Error("Tidak ada akun MetaMask yang terhubung.");
  await ensureChain();
  const account = getAddress(accounts[0]);
  const walletClient = createWalletClient({ account, chain: CHAIN, transport: custom(window.ethereum) });
  return { account, walletClient };
}

function sameAddress(a, b) {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function shorten(address) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
}

/**
 * Simulasi (supaya error revert terbaca) -> kirim tx lewat MetaMask -> tunggu receipt.
 * `expectedWallet` = wallet yang wajib dipakai (mis. wallet seller / buyer yang login).
 */
async function write({ address, abi, functionName, args, expectedWallet }) {
  assertConfigured();
  const { account, walletClient } = await getWallet();
  if (expectedWallet && !sameAddress(account, expectedWallet)) {
    throw new Error(`Gunakan wallet ${shorten(expectedWallet)} di MetaMask untuk aksi ini.`);
  }

  const { request } = await publicClient.simulateContract({ account, address, abi, functionName, args });
  const txHash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") throw new Error("Transaksi gagal di blockchain.");
  return { txHash, walletAddress: account, receipt };
}

// error token (mis. ERC20InsufficientBalance) ikut di-decode saat simulasi transaksi escrow
const ESCROW_ABI_WITH_TOKEN_ERRORS = [...ESCROW_ABI, ...MUSDT_ABI.filter((x) => x.type === "error")];

function escrowWrite(functionName, args, expectedWallet) {
  return write({ address: ESCROW_ADDRESS, abi: ESCROW_ABI_WITH_TOKEN_ERRORS, functionName, args, expectedWallet });
}

// ===================== Mock USDT =====================

export async function getMusdtInfo(address) {
  assertConfigured();
  const [balance, nextFaucetAt] = await Promise.all([
    publicClient.readContract({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "balanceOf", args: [address] }),
    publicClient.readContract({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "nextFaucetAt", args: [address] }),
  ]);
  return {
    balanceUnits: balance,
    balance: Number(formatUnits(balance, MUSDT_DECIMALS)),
    nextFaucetAt: Number(nextFaucetAt) * 1000, // ms, 0 = boleh klaim
  };
}

export async function getEthBalance(address) {
  const wei = await publicClient.getBalance({ address });
  return Number(formatUnits(wei, 18));
}

export function claimFaucet() {
  return write({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "faucet", args: [] });
}

// approve sekali untuk total semua order (kalau allowance belum cukup)
export async function ensureAllowance(totalUnits, expectedWallet) {
  assertConfigured();
  const { account } = await getWallet();
  if (expectedWallet && !sameAddress(account, expectedWallet)) {
    throw new Error(`Gunakan wallet ${shorten(expectedWallet)} di MetaMask untuk membayar.`);
  }

  const [allowance, balance] = await Promise.all([
    publicClient.readContract({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "allowance", args: [account, ESCROW_ADDRESS] }),
    publicClient.readContract({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "balanceOf", args: [account] }),
  ]);
  if (balance < totalUnits) {
    throw new Error(
      `Saldo mUSDT tidak cukup (${formatUnits(balance, MUSDT_DECIMALS)} / ${formatUnits(totalUnits, MUSDT_DECIMALS)}). Klaim dulu di halaman Faucet.`,
    );
  }
  if (allowance >= totalUnits) return null;

  return write({ address: MUSDT_ADDRESS, abi: MUSDT_ABI, functionName: "approve", args: [ESCROW_ADDRESS, totalUnits] });
}

// ===================== Escrow: read =====================

export async function getOnchainOrder(onchainOrderId) {
  assertConfigured();
  const order = await publicClient.readContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getOrder",
    args: [onchainOrderId],
  });
  return {
    ...order,
    statusName: ONCHAIN_STATUS[Number(order.status)] || "None",
    shipDeadlineMs: Number(order.shipDeadline) * 1000,
  };
}

export async function hasAdminRole(address) {
  if (!isOnchainConfigured() || !address) return false;
  const role = await publicClient.readContract({ address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "ADMIN_ROLE" });
  return publicClient.readContract({ address: ESCROW_ADDRESS, abi: ESCROW_ABI, functionName: "hasRole", args: [role, address] });
}

// ===================== Escrow: buyer =====================

// order = item dari response /Order/checkout
export function depositOrder(order, expectedWallet) {
  return escrowWrite(
    "deposit",
    [
      order.onchainOrderId,
      getAddress(order.sellerWallet),
      BigInt(order.itemsTotalUnits),
      BigInt(order.shippingFeeUnits),
      order.itemCount,
      BigInt(order.gasFeeUnits), // batas estimasi gas yang disetujui buyer
    ],
    expectedWallet,
  );
}

// buyer menerima barang langsung via transaksi (cadangan; alur utama v3 memakai signAcceptance)
export const releaseOnchain = (onchainOrderId, wallet) => escrowWrite("release", [onchainOrderId], wallet);

/**
 * v3: buyer menerima barang dengan TANDA TANGAN EIP-712 "Acceptance" (gratis, bukan transaksi, tanpa gas).
 * Tanda tangan ini yang nanti dipakai seller untuk mengklaim dana (releaseWithAcceptance).
 */
export async function signAcceptance(onchainOrderId, expectedWallet) {
  assertConfigured();
  const { account, walletClient } = await getWallet();
  if (expectedWallet && !sameAddress(account, expectedWallet)) {
    throw new Error(`Gunakan wallet ${shorten(expectedWallet)} di MetaMask untuk aksi ini.`);
  }

  const order = await getOnchainOrder(onchainOrderId);
  if (order.statusName !== "Shipped") {
    throw new Error("Order ini belum dikirim atau sudah selesai di smart contract. Muat ulang halaman.");
  }
  if (!sameAddress(order.buyer, account)) {
    throw new Error(`Gunakan wallet buyer ${shorten(order.buyer)} di MetaMask untuk menerima order ini.`);
  }

  return walletClient.signTypedData({
    account,
    domain: { name: "ChainShopEscrow", version: "1", chainId: CHAIN_ID, verifyingContract: ESCROW_ADDRESS },
    types: {
      Acceptance: [
        { name: "orderId", type: "bytes32" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "amount", type: "uint256" },
      ],
    },
    primaryType: "Acceptance",
    message: {
      orderId: onchainOrderId,
      buyer: order.buyer,
      seller: order.seller,
      amount: order.itemsTotal + order.shippingFee + order.gasFee,
    },
  });
}

// pintu darurat: seller tidak kirim sebelum batas -> buyer menarik dana sendiri (tanpa menunggu backend)
export const cancelExpiredOnchain = (onchainOrderId, wallet) => escrowWrite("cancelExpired", [onchainOrderId], wallet);

// ===================== Escrow: seller =====================

// refund oleh seller: sebelum dikirim = tolak order (semua dana ke buyer),
// setelah dikirim = konfirmasi retur (barang + ongkir ke buyer, estimasi gas ke seller)
export const sellerRefundOnchain = (onchainOrderId, wallet) => escrowWrite("refund", [onchainOrderId], wallet);

// v3: seller mengklaim dana memakai tanda tangan persetujuan buyer (gas dibayar seller)
export const claimPaymentOnchain = (onchainOrderId, signature, wallet) =>
  escrowWrite("releaseWithAcceptance", [onchainOrderId, signature], wallet);

// payload = data dari /Order/prepare-shipment -> invoice tercatat sebagai event InvoiceRecorded
export function markShippedOnchain(payload, wallet) {
  return escrowWrite(
    "markShipped",
    [
      payload.onchainOrderId,
      payload.invoiceId,
      payload.items.map((it) => ({ name: it.name, qty: BigInt(it.qty), unitPrice: BigInt(it.unitPriceUnits) })),
      payload.courier,
      payload.trackingNumber,
    ],
    wallet,
  );
}

// ===================== Escrow: admin (= arbiter) =====================

// approve refund "barang tak sampai": dana langsung dikembalikan ke buyer (wallet ber-ADMIN_ROLE)
export const adminRefundOnchain = (onchainOrderId) => escrowWrite("refund", [onchainOrderId]);
