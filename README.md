# Aplikasi Pelabelan Data Teks Berbasis Web

Proyek ini adalah aplikasi sederhana berbasis HTML, TailwindCSS, dan JavaScript murni untuk melakukan pelabelan data teks secara manual. Aplikasi ini dirancang untuk membantu proses labeling dataset seperti sentimen (Positive, Negative, Neutral) atau kategori lain sesuai kebutuhan pengguna.

Aplikasi berjalan sepenuhnya di sisi klien (client-side) tanpa backend, sehingga data tidak dikirim ke server dan tetap aman di perangkat pengguna.

---

## Fitur Utama

### 1. Upload Dataset CSV

Pengguna dapat mengunggah file CSV yang berisi data mentah. Setelah file diunggah:

* Aplikasi secara otomatis membaca header dari CSV.
* Dropdown kolom langsung menampilkan nama kolom.
* Step berikutnya langsung muncul tanpa memerlukan klik tambahan.

### 2. Memilih Kolom Teks

Pengguna menentukan kolom mana yang akan dilabeli menggunakan dropdown yang telah terisi otomatis sesuai isi CSV.

### 3. Proses Pelabelan Interaktif

Setiap baris dari kolom terpilih ditampilkan secara satu per satu. Pengguna dapat memberi label:

* **Positive**
* **Negative**
* **Neutral**
* Menghapus data jika tidak relevan.

Navigasi data menggunakan tombol:

* Previous
* Next
* Skip
* Delete

### 4. Fitur Monitoring

Bagian monitor menampilkan statistik pelabelan secara real-time:

* Jumlah data berlabel **Positive**
* Jumlah data berlabel **Negative**
* Jumlah data berlabel **Neutral**
* Jumlah data yang dihapus
* Jumlah data belum dilabeli

### 5. Download Hasil

Pengguna dapat mengunduh dataset hasil pelabelan dalam format CSV yang sudah lengkap dengan kolom:

* Teks
* Label
* Status (Jika dihapus)

---

## Teknologi yang Digunakan

* **HTML5**
* **TailwindCSS** (CDN)
* **JavaScript Murni (Vanilla JS)** untuk seluruh logika aplikasi
* Tidak menggunakan framework tambahan

---

## Struktur File

```
/
|-- index.html
|-- script.js
|-- README.md
```

---

## Cara Menggunakan

### 1. Buka File `index.html`

Cukup buka langsung di browser tanpa server tambahan.

### 2. Upload File CSV

Format CSV harus memiliki header di baris pertama. Contoh:

```csv
id,text
1,"Produk ini sangat bagus"
2,"Kurir lambat sekali"
3,"Biasa saja"
```

### 3. Pilih Kolom Teks

Dropdown akan terisi otomatis berdasarkan header.

### 4. Mulai Melabeli

Data akan muncul satu per satu. Pilih label sesuai kebutuhan.

### 5. Unduh Hasil

Setelah seluruh data selesai dilabeli, klik tombol **Download CSV**.

---

## Keamanan Data

* Aplikasi berjalan **100% di sisi klien**
* Tidak ada data yang dikirim atau disimpan ke server
* Semuanya diproses pada browser pengguna

---

## Lisensi

Proyek ini dirilis dengan lisensi MIT. Anda bebas menggunakan, memodifikasi, dan mendistribusikannya.

---
