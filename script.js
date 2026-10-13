```javascript
/*
=====================================================
 SITTA - SISTEM INFORMASI TATA KELOLA BAHAN AJAR
 Integrasi Supabase
=====================================================
*/

// ===================================================
// 1. KONFIGURASI
// ===================================================

const SITTA_CONFIG = window.sittaSupabaseConfig || {};

let sittaDB = null;
let daftarBahanAjar = [];

// ===================================================
// 2. MEMULAI APLIKASI
// ===================================================

document.addEventListener("DOMContentLoaded", async function () {
    pasangNavigasi();
    pasangPencarian();
    pasangFormPemesanan();
    pasangFormTracking();

    if (
        !window.supabase ||
        !SITTA_CONFIG.url ||
        !SITTA_CONFIG.key ||
        SITTA_CONFIG.key === "TEMPELKAN_PUBLISHABLE_KEY_ANDA_DI_SINI"
    ) {
        tampilkanNotifikasi(
            "Koneksi Supabase belum dikonfigurasi. Periksa index.html.",
            "error"
        );
        return;
    }

    sittaDB = window.supabase.createClient(
        SITTA_CONFIG.url,
        SITTA_CONFIG.key
    );

    await muatBahanAjar();
    await muatJumlahPesanan();
});

// ===================================================
// 3. NAVIGASI
// ===================================================

function pasangNavigasi() {
    document.querySelectorAll(".nav-btn").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            bukaHalaman(tombol.dataset.page);
        });
    });

    document.querySelectorAll("[data-go]").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            bukaHalaman(tombol.dataset.go);
        });
    });
}

function bukaHalaman(idHalaman) {
    const tujuan = document.getElementById(idHalaman);

    if (!tujuan) return;

    document.querySelectorAll(".page").forEach(function (halaman) {
        halaman.classList.remove("active");
    });

    tujuan.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(function (tombol) {
        tombol.classList.toggle(
            "active",
            tombol.dataset.page === idHalaman
        );
    });

    if (idHalaman === "katalog") {
        tampilkanKatalog();
    }

    if (idHalaman === "pemesanan") {
        isiPilihanBahanAjar();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ===================================================
// 4. NOTIFIKASI
// ===================================================

function tampilkanNotifikasi(pesan, jenis = "info") {
    const elemen = document.getElementById("notifikasi");

    if (!elemen) {
        console.log(pesan);
        return;
    }

    elemen.textContent = pesan;
    elemen.className = "notification";

    if (jenis === "error") {
        elemen.classList.add("error-message");
    }

    if (jenis === "success") {
        elemen.classList.add("success-message");
    }

    elemen.hidden = false;
}

function sembunyikanNotifikasi() {
    const elemen = document.getElementById("notifikasi");

    if (elemen) {
        elemen.hidden = true;
        elemen.textContent = "";
    }
}

// ===================================================
// 5. MEMUAT DATA BAHAN AJAR
// Struktur tabel:
// id, kode_bahan_ajar, judul, penulis, harga, stok
// ===================================================

async function muatBahanAjar() {
    if (!sittaDB) return;

    const { data, error } = await sittaDB
        .from("bahan_ajar")
        .select("id, kode_bahan_ajar, judul, penulis, harga, stok")
        .order("kode_bahan_ajar", { ascending: true });

    if (error) {
        console.error("Kesalahan membaca bahan ajar:", error);

        daftarBahanAjar = [];
        tampilkanKatalog();
        isiPilihanBahanAjar();
        perbaruiDashboard();

        tampilkanNotifikasi(
            "Data bahan ajar gagal dimuat. Periksa tabel dan kebijakan SELECT Supabase.",
            "error"
        );

        return;
    }

    daftarBahanAjar = (data || []).map(function (item) {
        return {
            id: item.id,
            kode: item.kode_bahan_ajar,
            judul: item.judul,
            penulis: item.penulis,
            harga: Number(item.harga || 0),
            stok: Number(item.stok || 0)
        };
    });

    tampilkanKatalog();
    isiPilihanBahanAjar();
    perbaruiDashboard();

    tampilkanNotifikasi(
        "Data bahan ajar berhasil dimuat.",
        "success"
    );
}

// ===================================================
// 6. DASHBOARD
// ===================================================

async function muatJumlahPesanan() {
    if (!sittaDB) return;

    const { count, error } = await sittaDB
        .from("pemesanan")
        .select("id", {
            count: "exact",
            head: true
        });

    if (error) {
        console.error("Kesalahan menghitung pesanan:", error);
        return;
    }

    const elemen = document.getElementById("totalTracking");

    if (elemen) {
        elemen.textContent = count ?? 0;
    }
}

function perbaruiDashboard() {
    const elemenBuku = document.getElementById("totalBuku");
    const elemenStok = document.getElementById("totalStok");
    const elemenPilihan = document.getElementById("bukuPilihan");

    if (elemenBuku) {
        elemenBuku.textContent = daftarBahanAjar.length;
    }

    const totalStok = daftarBahanAjar.reduce(function (total, buku) {
        return total + buku.stok;
    }, 0);

    if (elemenStok) {
        elemenStok.textContent = totalStok.toLocaleString("id-ID");
    }

    if (!elemenPilihan) return;

    if (daftarBahanAjar.length === 0) {
        elemenPilihan.innerHTML =
            '<p class="empty-state">Data bahan ajar belum tersedia.</p>';
        return;
    }

    elemenPilihan.innerHTML = daftarBahanAjar
        .slice(0, 3)
        .map(function (buku) {
            return `
                <article class="book-card">
                    <div class="book-cover">
                        <span>${escapeHTML(buku.kode)}</span>
                    </div>
                    <div class="book-info">
                        <h3>${escapeHTML(buku.judul)}</h3>
                        <p>Kode: ${escapeHTML(buku.kode)}</p>
                        <p>Penulis: ${escapeHTML(buku.penulis || "-")}</p>
                        <p>Harga: ${formatRupiah(buku.harga)}</p>
                        <p>Stok: ${buku.stok}</p>
                    </div>
                </article>
            `;
        }).join("");
}

// ===================================================
// 7. KATALOG DAN PENCARIAN
// ===================================================

function pasangPencarian() {
    const kolomCari = document.getElementById("cariBuku");

    if (kolomCari) {
        kolomCari.addEventListener("input", tampilkanKatalog);
    }

    const filterJenis = document.getElementById("filterJenis");

    // Database saat ini belum memiliki kolom jenis bahan ajar.
    // Filter jenis dinonaktifkan agar tidak salah memfilter data.
    if (filterJenis) {
        filterJenis.disabled = true;
        filterJenis.title =
            "Filter jenis belum tersedia pada struktur database saat ini.";
    }
}

function tampilkanKatalog() {
    const tabel = document.getElementById("tabelBuku");
    const jumlahHasil = document.getElementById("jumlahHasil");

    if (!tabel) return;

    const kolomCari = document.getElementById("cariBuku");
    const kataKunci = kolomCari
        ? kolomCari.value.trim().toLowerCase()
        : "";

    const hasil = daftarBahanAjar.filter(function (buku) {
        return (
            String(buku.kode || "").toLowerCase().includes(kataKunci) ||
            String(buku.judul || "").toLowerCase().includes(kataKunci) ||
            String(buku.penulis || "").toLowerCase().includes(kataKunci)
        );
    });

    if (jumlahHasil) {
        jumlahHasil.textContent =
            hasil.length + " bahan ajar ditemukan";
    }

    if (hasil.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Tidak ada bahan ajar yang ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = hasil.map(function (buku) {
        let status = "Tersedia";
        let kelas = "status";

        if (buku.stok <= 0) {
            status = "Stok Habis";
            kelas += " empty";
        } else if (buku.stok <= 20) {
            status = "Stok Terbatas";
            kelas += " warning";
        }

        return `
            <tr>
                <td>${escapeHTML(buku.kode)}</td>
                <td>${escapeHTML(buku.judul)}</td>
                <td>${escapeHTML(buku.penulis || "-")}</td>
                <td>${formatRupiah(buku.harga)}</td>
                <td>${buku.stok.toLocaleString("id-ID")}</td>
                <td><span class="${kelas}">${status}</span></td>
                <td>
                    <button
                        type="button"
                        class="btn-pesan"
                        data-pilih-buku="${escapeHTML(buku.kode)}"
                        ${buku.stok <= 0 ? "disabled" : ""}
                    >
                        Pilih
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tabel.querySelectorAll("[data-pilih-buku]").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            const kode = tombol.dataset.pilihBuku;
            bukaHalaman("pemesanan");

            const pilihan = document.getElementById("pilihBuku");

            if (pilihan) {
                pilihan.value = kode;
            }
        });
    });
}

// ===================================================
// 8. PILIHAN BAHAN AJAR
// ===================================================

function isiPilihanBahanAjar() {
    const pilihan = document.getElementById("pilihBuku");

    if (!pilihan) return;

    const nilaiSebelumnya = pilihan.value;

    pilihan.innerHTML =
        '<option value="">-- Pilih bahan ajar --</option>';

    daftarBahanAjar.forEach(function (buku) {
        const opsi = document.createElement("option");

        opsi.value = buku.kode;
        opsi.textContent =
            buku.kode + " - " + buku.judul +
            " | " + formatRupiah(buku.harga) +
            " | Stok: " + buku.stok;

        opsi.disabled = buku.stok <= 0;

        pilihan.appendChild(opsi);
    });

    if (daftarBahanAjar.some(function (buku) {
        return buku.kode === nilaiSebelumnya && buku.stok > 0;
    })) {
        pilihan.value = nilaiSebelumnya;
    }
}

// ===================================================
// 9. PEMESANAN
// Tabel pemesanan:
// nomor_pesanan, nama_pemesan, tanggal_pesan, status
//
// Tabel detail_pemesanan:
// pemesanan_id, bahan_ajar_id, jumlah, harga_satuan
// ===================================================

function pasangFormPemesanan() {
    const form = document.getElementById("formPemesanan");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        if (!sittaDB) {
            tampilkanNotifikasi(
                "Database belum terhubung.",
                "error"
            );
            return;
        }

        const namaInput = document.getElementById("namaPemesan");
        const emailInput = document.getElementById("emailPemesan");
        const pilihanInput = document.getElementById("pilihBuku");
        const jumlahInput = document.getElementById("jumlahBuku");
        const catatanInput = document.getElementById("catatan");
        const hasil = document.getElementById("hasilPemesanan");

        const nama = namaInput ? namaInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const kode = pilihanInput ? pilihanInput.value : "";
        const jumlah = Number(jumlahInput ? jumlahInput.value : 0);
        const catatan = catatanInput ? catatanInput.value.trim() : "";

        if (!nama || !kode || !Number.isInteger(jumlah) || jumlah < 1) {
            tampilkanNotifikasi(
                "Lengkapi nama pemesan, bahan ajar, dan jumlah pesanan.",
                "error"
            );
            return;
        }

        const buku = daftarBahanAjar.find(function (item) {
            return item.kode === kode;
        });

        if (!buku) {
            tampilkanNotifikasi(
                "Bahan ajar tidak ditemukan. Muat ulang halaman.",
                "error"
            );
            return;
        }

        if (jumlah > buku.stok) {
            tampilkanNotifikasi(
                "Jumlah pesanan melebihi stok yang tersedia.",
                "error"
            );
            return;
        }

        const tombolKirim = form.querySelector('[type="submit"]');
        const teksTombolLama = tombolKirim
            ? tombolKirim.textContent
            : "";

        if (tombolKirim) {
            tombolKirim.disabled = true;
            tombolKirim.textContent = "Menyimpan pesanan...";
        }

        try {
            const nomorPesanan = buatNomorPesanan();

            // LANGKAH A:
            // Simpan data utama ke tabel pemesanan.
            // select("id") membutuhkan kebijakan SELECT yang sesuai.
            const { data: pesananBaru, error: errorPesanan } =
                await sittaDB
                    .from("pemesanan")
                    .insert({
                        nomor_pesanan: nomorPesanan,
                        nama_pemesan: nama,
                        status: "Menunggu"
                    })
                    .select("id, nomor_pesanan")
                    .single();

            if (errorPesanan) {
                console.error("Gagal menyimpan pesanan:", errorPesanan);

                tampilkanNotifikasi(
                    "Pesanan utama gagal disimpan. Periksa kebijakan INSERT dan SELECT pada tabel pemesanan.",
                    "error"
                );
                return;
            }

            // LANGKAH B:
            // Simpan rincian bahan ajar yang dipesan.
            const { error: errorDetail } = await sittaDB
                .from("detail_pemesanan")
                .insert({
                    pemesanan_id: pesananBaru.id,
                    bahan_ajar_id: buku.id,
                    jumlah: jumlah,
                    harga_satuan: buku.harga
                });

            if (errorDetail) {
                console.error(
                    "Gagal menyimpan detail pesanan:",
                    errorDetail
                );

                tampilkanNotifikasi(
                    "Data pesanan utama sudah tersimpan, tetapi rincian pesanan gagal disimpan. Periksa kebijakan INSERT pada detail_pemesanan.",
                    "error"
                );

                if (hasil) {
                    hasil.innerHTML = `
                        <div class="result-card">
                            <h3>Pesanan Belum Lengkap</h3>
                            <p>Nomor pesanan: <strong>${escapeHTML(nomorPesanan)}</strong></p>
                            <p>Data utama tersimpan, tetapi rincian bahan ajar belum tersimpan.</p>
                            <p>Jangan kirim pesanan berulang kali sebelum masalah ini diperiksa.</p>
                        </div>
                    `;
                }

                return;
            }

            const totalHarga = buku.harga * jumlah;

            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Pesanan Berhasil Disimpan</h3>
                        <p>Nomor pesanan:
                            <strong>${escapeHTML(nomorPesanan)}</strong>
                        </p>
                        <p>Nama pemesan: ${escapeHTML(nama)}</p>
                        <p>Bahan ajar: ${escapeHTML(buku.judul)}</p>
                        <p>Kode bahan ajar: ${escapeHTML(buku.kode)}</p>
                        <p>Jumlah: ${jumlah}</p>
                        <p>Harga satuan: ${formatRupiah(buku.harga)}</p>
                        <p>Total pesanan: <strong>${formatRupiah(totalHarga)}</strong></p>
                        <p>Status: <strong>Menunggu</strong></p>
                        ${catatan ? `<p>Catatan: ${escapeHTML(catatan)}</p>` : ""}
                        ${email ? `<p>Email: ${escapeHTML(email)}</p>` : ""}
                        <p class="success-message">
                            Simpan nomor pesanan untuk memeriksa statusnya.
                        </p>
                    </div>
                `;
            }

            tampilkanNotifikasi(
                "Pesanan dan rincian bahan ajar berhasil disimpan.",
                "success"
            );

            form.reset();
            await muatJumlahPesanan();
        } catch (error) {
            console.error("Kesalahan saat memesan:", error);

            tampilkanNotifikasi(
                "Terjadi kesalahan saat menyimpan pesanan. Periksa Console dan Supabase.",
                "error"
            );
        } finally {
            if (tombolKirim) {
                tombolKirim.disabled = false;
                tombolKirim.textContent = teksTombolLama || "Kirim Pesanan";
            }
        }
    });
}

function buatNomorPesanan() {
    const waktu = Date.now().toString();
    const angka = Math.floor(1000 + Math.random() * 9000);

    // Panjang di bawah batas 30 karakter pada database.
    return "ST" + waktu + angka;
}

// ===================================================
// 10. TRACKING STATUS PESANAN
// Mencari nomor_pesanan pada tabel pemesanan.
// ===================================================

function pasangFormTracking() {
    const form = document.getElementById("formTracking");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        const inputNomor = document.getElementById("nomorDO");
        const hasil = document.getElementById("hasilTracking");

        const nomor = inputNomor
            ? inputNomor.value.trim()
            : "";

        if (!nomor) {
            tampilkanNotifikasi(
                "Masukkan nomor pesanan terlebih dahulu.",
                "error"
            );
            return;
        }

        if (!sittaDB) {
            tampilkanNotifikasi(
                "Database belum terhubung.",
                "error"
            );
            return;
        }

        if (hasil) {
            hasil.innerHTML =
                '<p class="loading-state">Memeriksa status pesanan...</p>';
        }

        const { data, error } = await sittaDB
            .from("pemesanan")
            .select("nomor_pesanan, nama_pemesan, tanggal_pesan, status")
            .eq("nomor_pesanan", nomor)
            .maybeSingle();

        if (error) {
            console.error("Gagal mencari pesanan:", error);

            if (hasil) {
                hasil.innerHTML =
                    '<p class="error-message">Status pesanan gagal diperiksa. Periksa kebijakan SELECT pada tabel pemesanan.</p>';
            }
            return;
        }

        if (!data) {
            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Pesanan Tidak Ditemukan</h3>
                        <p>Nomor pesanan <strong>${escapeHTML(nomor)}</strong> tidak ditemukan.</p>
                        <p>Periksa kembali nomor yang dimasukkan.</p>
                    </div>
                `;
            }
            return;
        }

        if (hasil) {
            hasil.innerHTML = `
                <div class="result-card">
                    <h3>Status Pesanan</h3>
                    <div class="result-grid">
                        <div>
                            <span>Nomor Pesanan</span>
                            <strong>${escapeHTML(data.nomor_pesanan)}</strong>
                        </div>
                        <div>
                            <span>Nama Pemesan</span>
                            <strong>${escapeHTML(data.nama_pemesan)}</strong>
                        </div>
                        <div>
                            <span>Tanggal Pesan</span>
                            <strong>${escapeHTML(formatTanggal(data.tanggal_pesan))}</strong>
                        </div>
                        <div>
                            <span>Status</span>
                            <strong>${escapeHTML(data.status)}</strong>
                        </div>
                    </div>
                    <p>
                        Informasi ini menunjukkan status pesanan,
                        bukan lokasi perjalanan kurir.
                    </p>
                </div>
            `;
        }
    });
}

// ===================================================
// 11. FORMAT DATA
// ===================================================

function formatRupiah(nilai) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(nilai || 0));
}

function formatTanggal(nilai) {
    if (!nilai) return "-";

    const tanggal = new Date(nilai + "T00:00:00");

    if (Number.isNaN(tanggal.getTime())) {
        return String(nilai);
    }

    return tanggal.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

// ===================================================
// 12. MENCEGAH HTML DARI INPUT MENJADI KODE
// ===================================================

function escapeHTML(nilai) {
    return String(nilai ?? "").replace(/[&<>"']/g, function (karakter) {
        const pengganti = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return pengganti[karakter];
    });
}
```
