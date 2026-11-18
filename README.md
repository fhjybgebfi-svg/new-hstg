# C666 Cyber War

Game browser 2D bertema astronot mini cyberpunk. Repository ini berisi frontend dan server Socket.IO untuk room multiplayer.

## Isi yang aktif

- Game arena 2D lokal melawan bot.
- Kontrol keyboard dan tombol sentuh Android.
- Kustomisasi nama dan warna karakter.
- Diamond virtual, paket demo, lucky spin, dan inventory.
- Event lokal Halloween, Cyberpunk, dan Winter.
- Bundle kosmetik demo.
- Server Node.js + Socket.IO: buat/gabung room, posisi pemain, chat room, event room.
- Endpoint kesehatan `/health`.

## Jalankan di komputer

Butuh Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env
npm start
```

Buka `http://localhost:3000`.

Atur `ADMIN_TOKEN` di `.env` dengan string acak yang panjang. Token ini diperlukan untuk mengubah event pada room multiplayer. Jangan commit file `.env`.

## Jalankan dari Android

Cara termudah:
1. Buat repository baru di GitHub.
2. Upload seluruh isi folder repository ini (bukan folder ZIP-nya).
3. Untuk menguji frontend statis, buka `public/index.html` melalui preview editor HTML atau deploy GitHub Pages.
4. Untuk multiplayer, deploy repository sebagai Node Web Service pada host yang mendukung Node.js. Atur `ADMIN_TOKEN` pada environment variables.
5. Setelah server aktif, salin URL server ke kolom **Alamat server** di menu Arena.

GitHub Pages hanya menyajikan file statis. `server.js`, Socket.IO room, chat online, dan event room membutuhkan server Node yang aktif. Jangan mengisi alamat server dengan URL repository GitHub.

## GitHub Pages

Frontend statis dapat dipublikasikan dari folder `public`:
- Repository → Settings → Pages
- Build and deployment → Deploy from a branch
- Branch `main`, folder `/public`
- Save

Catatan: halaman statis tidak menyediakan server multiplayer. Mode bot lokal, karakter, saldo demo, spin demo, inventory, dan event lokal dapat berjalan; room online memerlukan backend Node.

## Deploy backend

Gunakan layanan hosting Node.js yang mendukung WebSocket:
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `ADMIN_TOKEN` = secret acak panjang
- Environment variable: `PUBLIC_ORIGIN` = URL frontend, jika penyedia hosting menerapkan pembatasan origin
- Environment variable: `PORT` biasanya disediakan otomatis oleh host

Server juga dapat dijalankan melalui Docker:

```bash
docker build -t c666-cyber-war .
docker run -p 3000:3000 -e ADMIN_TOKEN='secret-acak-panjang' c666-cyber-war
```

## Batasan versi ini

- Akun menggunakan nama pilot lokal, bukan Google OAuth.
- Tidak ada pengumpulan password Google atau WhatsApp.
- Diamond dan top-up adalah simulasi saldo; tidak ada pembayaran nyata.
- Data akun dan inventori tersimpan di `localStorage` browser, bukan database cloud.
- Server multiplayer mengelola room, chat, dan posisi pemain. Pertandingan multiplayer belum memakai simulasi damage/weapon server-authoritative.
- Statistik admin belum terhubung ke database.
- Skin dan bundle saat ini kosmetik 2D/placeholder visual; animasi kosmetik khusus dan aset sprite final perlu ditambahkan.

## Lisensi

Private project. Tambahkan lisensi sendiri jika ingin mendistribusikan source.
