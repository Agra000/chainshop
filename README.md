# ChainShop

Frontend marketplace web3 (Next.js 14 App Router + Tailwind CSS) untuk ChainShop —
tampilan seperti Tokopedia/Shopee/Amazon, tapi setiap pembayaran "ditahan" di
escrow dan baru cair ke seller setelah pembeli konfirmasi barang diterima.

**Status saat ini:** terhubung ke backend .NET (repo `chainshop_b`) dan smart contract
escrow di Sepolia testnet (folder `chainshop-contracts`).

## Escrow on-chain (Sepolia testnet, Mock USDT)

Pembayaran sekarang memakai smart contract `ChainShopEscrow` + token `MockUSDT` (mUSDT)
di **Sepolia testnet** — tidak ada uang asli. Source contract ada di folder
`chainshop-contracts` (lihat README di sana untuk deploy).

1. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_ESCROW_ADDRESS` dan
   `NEXT_PUBLIC_MUSDT_ADDRESS` dari output deploy.
2. `npm install` (dependency baru: `viem`), lalu `npm run dev`.
3. Wallet MetaMask di jaringan Sepolia butuh sedikit Sepolia ETH (gas) dan mUSDT
   (klaim di halaman **/faucet**, 10.000 mUSDT per 24 jam).

Alur singkat (v3, hemat gas — hanya aksi uang + invoice yang on-chain):

- **Checkout** dipecah per seller (1 order = 1 escrow = 1 invoice). Buyer membayar harga barang + ongkir +
  estimasi gas (±) untuk 2 transaksi seller (kirim + klaim dana); seluruh estimasi gas diberikan ke seller.
- **Seller** acc order, pilih kurir + driver, klik **Ship & record invoice** → nomor resi di-generate backend dan invoice tercatat on-chain (event `InvoiceRecorded`).
  Status mock "On the way" dan "Arrived at buyer" tidak memakai MetaMask.
- **Buyer** punya 3 hari untuk **Accept** (cukup **tanda tangan** EIP-712 di MetaMask: gratis, tanpa gas) atau **Request refund** (tanpa MetaMask: alasan,
  foto, ID transaksi invoice; maksimal 3x). Tidak merespons = otomatis diterima oleh cron backend.
- Setelah buyer accept, **seller** klik **Claim payment** (MetaMask `releaseWithAcceptance`, gas dibayar seller)
  untuk mencairkan dana. Contract memverifikasi tanda tangan buyer.
- **Admin** (role `admin` di `msusers`) memutuskan refund di menu profil → **Refund Arbitration**. Tolak dan
  setujui-dengan-retur tanpa MetaMask (konfirmasi lewat modal); setujui refund "barang tak sampai" memakai MetaMask (`refund`).
- **Retur** dicatat tanpa MetaMask; seller konfirmasi retur dengan MetaMask (`refund`).
- Batas waktu dijalankan cron backend (wallet operator). Buyer tetap bisa membatalkan sendiri on-chain jika
  seller tidak mengirim sebelum batas waktu.

## Menjalankan project

Butuh Node.js 18+ terpasang di komputer kamu.

```bash
npm install
npm run dev
```

Lalu buka http://localhost:3000

## Struktur folder penting

```
config/colors.js        -> SEMUA warna aplikasi, edit di sini saja
data/products.js        -> katalog produk dummy
data/categories.js      -> daftar kategori di navbar
context/                -> state management (Auth, Cart, Transaction)
components/layout/      -> navbar, search bar, category bar, dropdown akun
components/product/     -> kartu produk, galeri gambar, tombol beli
components/cart/        -> baris item di halaman cart
components/payment/     -> pemilihan metode bayar, modal konfirmasi
components/transaction/ -> timeline tracking, kartu order
app/                     -> semua halaman (routing Next.js App Router)
```

## Mengganti warna

Buka `config/colors.js`. Setiap kunci warna (mis. `seal`, `ledger`, `signal`)
otomatis tersedia sebagai class Tailwind (`bg-seal`, `text-ledger-dark`, dst)
lewat `tailwind.config.js`. Ganti nilai hex-nya saja, tidak perlu sentuh file
lain.

## Alur yang sudah jalan (dengan data dummy)

1. **Sign up / Log in** — dummy, tidak perlu email/password asli. Ada juga
   opsi "Connect a wallet" yang men-generate alamat wallet palsu untuk demo.
2. **Browse & filter** — klik kategori di navbar bawah atau ketik di search
   bar, produk di halaman utama akan ter-filter.
3. **Detail produk** → Add to Cart / Buy Now.
4. **Cart** — checklist item yang mau dibayar, subtotal muncul di bar bawah
   yang fixed.
5. **Payment** — ringkasan barang, rincian harga termasuk **gas fee
   blockchain** (dummy, dihitung dari `estimateGasFee` di `lib/format.js`),
   pilih metode bayar, klik Bayar → modal konfirmasi.
6. **Transaction** — setelah bayar, order otomatis punya status "Order
   Placed". Karena belum ada integrasi kurir sungguhan, di halaman detail
   transaksi ada tombol demo **"Simulate next update"** untuk menaikkan
   status secara manual (Packed → Picked Up → On the Way → Arrived).
   Begitu status "Arrived at Destination", tombol **"Confirm Item Received"**
   akan muncul — ini yang mensimulasikan escrow melepas dana ke seller.
7. **History** — order yang sudah "Completed" otomatis pindah ke sini.

## Yang perlu diganti kalau lanjut ke smart contract sungguhan

Semua titik yang masih dummy sudah ditandai komentar di kode, terutama di:

- `context/TransactionContext.jsx` — fungsi `createTransaction`,
  `confirmReceived` (ini titik paling penting untuk sambungan ke smart
  contract escrow asli, ganti `generateTxHash()` dengan hasil transaksi
  on-chain sungguhan).
- `context/AuthContext.jsx` — fungsi `loginWithWallet` (ganti dengan
  wallet connector asli seperti wagmi/viem/RainbowKit).
- `lib/format.js` — fungsi `estimateGasFee` (ganti dengan estimasi gas
  fee asli dari network yang dipakai, lalu convert ke USDT kalau masih
  mau ditampilkan dalam USDT).

## Catatan lain

- Harga barang ditampilkan dalam USDT (`formatUSDT`),
  sesuai permintaan — blockchain di sini berperan sebagai lapisan
  escrow/pencatatan transaksi, bukan sebagai mata uang produk.
- Gambar produk pakai placeholder dari picsum.photos — tinggal ganti URL di
  `data/products.js` dengan foto produk asli nanti.
- Setiap halaman (kecuali beranda) punya tombol Back di kiri atas.
