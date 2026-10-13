```javascript
/* =====================================================
   SITTA - DATA UTAMA APLIKASI
   File: data.js
   ===================================================== */


/* ================= 1. DATA PENGGUNA ================= */

window.dataPengguna = [
    {
        id: 1,
        nama: "Rina Wulandari",
        email: "rina@ut.ac.id",
        password: "rina123",
        role: "UPBJJ-UT",
        lokasi: "UPBJJ Jakarta"
    },
    {
        id: 2,
        nama: "Agus Pranoto",
        email: "agus@ut.ac.id",
        password: "agus123",
        role: "UPBJJ-UT",
        lokasi: "UPBJJ Makassar"
    },
    {
        id: 3,
        nama: "Siti Marlina",
        email: "siti@ut.ac.id",
        password: "siti123",
        role: "Puslaba",
        lokasi: "Pusat"
    },
    {
        id: 4,
        nama: "Doni Setiawan",
        email: "doni@ut.ac.id",
        password: "doni123",
        role: "Fakultas",
        lokasi: "FISIP"
    },
    {
        id: 5,
        nama: "Admin SITTA",
        email: "admin@ut.ac.id",
        password: "admin123",
        role: "Administrator",
        lokasi: "Pusat"
    }
];


/* ================= 2. DATA BAHAN AJAR ================= */

window.dataBahanAjar = [
    {
        kodeLokasi: "0TMP01",
        kodeBarang: "ASIP4301",
        namaBarang: "Pengantar Ilmu Komunikasi",
        jenisBarang: "BMP",
        edisi: "2",
        stok: 548,
        cover: "img/pengantar_komunikasi.jpg"
    },
    {
        kodeLokasi: "0JKT01",
        kodeBarang: "EKMA4216",
        namaBarang: "Manajemen Keuangan",
        jenisBarang: "BMP",
        edisi: "3",
        stok: 392,
        cover: "img/manajemen_keuangan.jpg"
    },
    {
        kodeLokasi: "0SBY02",
        kodeBarang: "EKMA4310",
        namaBarang: "Kepemimpinan",
        jenisBarang: "BMP",
        edisi: "1",
        stok: 278,
        cover: "img/kepemimpinan.jpg"
    },
    {
        kodeLokasi: "0MLG01",
        kodeBarang: "BIOL4211",
        namaBarang: "Mikrobiologi Dasar",
        jenisBarang: "BMP",
        edisi: "2",
        stok: 165,
        cover: "img/mikrobiologi.jpg"
    },
    {
        kodeLokasi: "0UPBJJBDG",
        kodeBarang: "PAUD4401",
        namaBarang: "Perkembangan Anak Usia Dini",
        jenisBarang: "BMP",
        edisi: "4",
        stok: 204,
        cover: "img/paud_perkembangan.jpg"
    }
];


/* ================= 3. DATA TRACKING ================= */

window.dataTracking = {
    "2023001234": {
        nomorDO: "2023001234",
        nama: "Rina Wulandari",
        status: "Dalam Perjalanan",
        ekspedisi: "JNE",
        tanggalKirim: "2025-08-25",
        paket: "0JKT01",
        total: "Rp 180.000",
        perjalanan: [
            {
                waktu: "2025-08-25 10:12:20",
                keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka"
            },
            {
                waktu: "2025-08-25 14:07:56",
                keterangan: "Tiba di Hub: TANGERANG SELATAN"
            },
            {
                waktu: "2025-08-25 16:30:10",
                keterangan: "Diteruskan ke Kantor Jakarta Selatan"
            }
        ]
    },

    "2023005678": {
        nomorDO: "2023005678",
        nama: "Agus Pranoto",
        status: "Selesai Dikirim",
        ekspedisi: "Pos Indonesia",
        tanggalKirim: "2025-08-25",
        paket: "0UPBJJBDG",
        total: "Rp 220.000",
        perjalanan: [
            {
                waktu: "2025-08-25 10:12:20",
                keterangan: "Penerimaan di Loket: TANGERANG SELATAN. Pengirim: Universitas Terbuka"
            },
            {
                waktu: "2025-08-25 14:07:56",
                keterangan: "Tiba di Hub: TANGERANG SELATAN"
            },
            {
                waktu: "2025-08-25 16:30:10",
                keterangan: "Diteruskan ke Kantor Kota Bandung"
            },
            {
                waktu: "2025-08-26 12:15:33",
                keterangan: "Tiba di Hub: Kota BANDUNG"
            },
            {
                waktu: "2025-08-26 15:06:12",
                keterangan: "Proses antar ke Cimahi"
            },
            {
                waktu: "2025-08-26 20:00:00",
                keterangan: "Selesai Antar. Penerima: Agus Pranoto"
            }
        ]
    }
};


/* ================= 4. DATA PEMESANAN ================= */

window.dataPemesanan = {
    "2023001234": {
        nomorDO: "2023001234",
        nama: "Rina Wulandari",
        nim: "041234567",
        lokasi: "UPBJJ Jakarta",
        tanggalPesan: "2025-08-24",
        statusPesanan: "Diproses",
        daftarPesanan: [
            {
                kodeBarang: "ASIP4301",
                namaBarang: "Pengantar Ilmu Komunikasi",
                jumlah: 2,
                harga: 60000,
                subtotal: 120000
            },
            {
                kodeBarang: "EKMA4216",
                namaBarang: "Manajemen Keuangan",
                jumlah: 1,
                harga: 60000,
                subtotal: 60000
            }
        ],
        totalItem: 3,
        totalPembayaran: 180000
    },

    "2023005678": {
        nomorDO: "2023005678",
        nama: "Agus Pranoto",
        nim: "041234568",
        lokasi: "UPBJJ Bandung",
        tanggalPesan: "2025-08-24",
        statusPesanan: "Selesai Dikirim",
        daftarPesanan: [
            {
                kodeBarang: "PAUD4401",
                namaBarang: "Perkembangan Anak Usia Dini",
                jumlah: 2,
                harga: 80000,
                subtotal: 160000
            },
            {
                kodeBarang: "EKMA4310",
                namaBarang: "Kepemimpinan",
                jumlah: 1,
                harga: 60000,
                subtotal: 60000
            }
        ],
        totalItem: 3,
        totalPembayaran: 220000
    }
};


/* ================= 5. PEMERIKSAAN DATA ================= */

console.log("SITTA: data.js berhasil dimuat.");
console.log("Jumlah pengguna:", dataPengguna.length);
console.log("Jumlah bahan ajar:", dataBahanAjar.length);
console.log("Jumlah data tracking:", Object.keys(dataTracking).length);
console.log("Jumlah data pemesanan:", Object.keys(dataPemesanan).length);
```
