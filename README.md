# ChainShop

Frontend marketplace web3 (Next.js 14 App Router + Tailwind CSS) untuk ChainShop —
tampilan seperti Tokopedia/Shopee/Amazon, tapi setiap pembayaran "ditahan" di
escrow dan baru cair ke seller setelah pembeli konfirmasi barang diterima.

**Status saat ini: frontend only, dengan data dummy.** Belum ada smart contract
sungguhan atau backend — semua state (login, cart, transaksi, status escrow)
disimpan di `localStorage` browser lewat React Context, supaya alurnya bisa
langsung dicoba end-to-end tanpa server.

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
   blockchain** (dummy, dihitung dari `estimateGasFeeIDR` di `lib/format.js`),
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
- `lib/format.js` — fungsi `estimateGasFeeIDR` (ganti dengan estimasi gas
  fee asli dari network yang dipakai, lalu convert ke Rupiah kalau masih
  mau ditampilkan dalam Rupiah).

## Catatan lain

- Harga barang ditampilkan dalam Rupiah (`Intl.NumberFormat("id-ID")`),
  sesuai permintaan — blockchain di sini berperan sebagai lapisan
  escrow/pencatatan transaksi, bukan sebagai mata uang produk.
- Gambar produk pakai placeholder dari picsum.photos — tinggal ganti URL di
  `data/products.js` dengan foto produk asli nanti.
- Setiap halaman (kecuali beranda) punya tombol Back di kiri atas.
