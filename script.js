```javascript
/*
====================================================
 SITTA - SISTEM INFORMASI TATA KELOLA BAHAN AJAR
 Integrasi Supabase
====================================================
*/

// ================================================
// 1. KONFIGURASI SUPABASE
// ================================================

const SITTA_CONFIG = window.sittaSupabaseConfig || {};

let sittaDB = null;
let daftarBahanAjar = [];
let halamanAktif = "dashboard";

// ================================================
// 2. INISIALISASI APLIKASI
// ================================================

document.addEventListener("DOMContentLoaded", async function () {
    pasangNavigasi();
    pasangFormTracking();
    pasangFormPemesanan();
    pasangPencarianBuku();

    if (
        window.supabase &&
        SITTA_CONFIG.url &&
        SITTA_CONFIG.key &&
        SITTA_CONFIG.key !== "TEMPELKAN_PUBLISHABLE_KEY_ANDA_DI_SINI"
    ) {
        try {
            sittaDB = window.supabase.createClient(
                SITTA_CONFIG.url,
                SITTA_CONFIG.key
            );

            await muatDataBahanAjar();
            await muatRingkasanTracking();
        } catch (error) {
            console.error("Gagal menginisialisasi Supabase:", error);
            tampilkanNotifikasi(
                "Koneksi database gagal. Periksa konfigurasi Supabase.",
                "error"
            );
        }
    } else {
        tampilkanNotifikasi(
            "Supabase belum terhubung. Periksa URL dan publishable key di index.html.",
            "error"
        );
    }

    perbaruiTampilanDashboard();
    tampilkanKatalog();
    isiPilihanBuku();
});

// ================================================
// 3. NAVIGASI HALAMAN
// ================================================

function pasangNavigasi() {
    const tombolNavigasi = document.querySelectorAll(".nav-btn");

    tombolNavigasi.forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            const tujuan = tombol.dataset.page;

            if (!tujuan) return;

            bukaHalaman(tujuan);
        });
    });

    document.querySelectorAll("[data-go]").forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            bukaHalaman(tombol.dataset.go);
        });
    });
}

function bukaHalaman(namaHalaman) {
    const halamanTujuan = document.getElementById(namaHalaman);

    if (!halamanTujuan) return;

    document.querySelectorAll(".page").forEach(function (halaman) {
        halaman.classList.remove("active");
    });

    halamanTujuan.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(function (tombol) {
        tombol.classList.toggle(
            "active",
            tombol.dataset.page === namaHalaman
        );
    });

    halamanAktif = namaHalaman;

    if (namaHalaman === "katalog") {
        tampilkanKatalog();
    }

    if (namaHalaman === "pemesanan") {
        isiPilihanBuku();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================================================
// 4. NOTIFIKASI
// ================================================

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
    } else if (jenis === "success") {
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

// ================================================
// 5. MEMUAT DATA BAHAN AJAR DARI SUPABASE
// ================================================

async function muatDataBahanAjar() {
    if (!sittaDB) return;

    const { data, error } = await sittaDB
        .from("bahan_ajar")
        .select("*")
        .order("kode_barang", { ascending: true });

    if (error) {
        console.error("Gagal memuat bahan ajar:", error);

        daftarBahanAjar = [];
        tampilkanKatalog();
        isiPilihanBuku();

        tampilkanNotifikasi(
            "Data bahan ajar belum dapat dimuat. Pastikan tabel bahan_ajar sudah dibuat di Supabase dan kebijakan aksesnya benar.",
            "error"
        );

        return;
    }

    daftarBahanAjar = (data || []).map(function (baris) {
        return {
            id: baris.id,
            kodeLokasi: baris.kode_lokasi,
            kodeBarang: baris.kode_barang,
            namaBarang: baris.nama_barang,
            jenisBarang: baris.jenis_barang,
            edisi: baris.edisi,
            stok: Number(baris.stok || 0),
            cover: baris.cover
        };
    });

    tampilkanKatalog();
    isiPilihanBuku();
    perbaruiTampilanDashboard();
}

// ================================================
// 6. DASHBOARD
// ================================================

async function muatRingkasanTracking() {
    if (!sittaDB) return;

    const { count, error } = await sittaDB
        .from("tracking")
        .select("*", { count: "exact", head: true });

    if (error) {
        console.error("Gagal menghitung tracking:", error);
        return;
    }

    const elemenTracking = document.getElementById("totalTracking");

    if (elemenTracking) {
        elemenTracking.textContent = count ?? 0;
    }
}

function perbaruiTampilanDashboard() {
    const totalBuku = document.getElementById("totalBuku");
    const totalStok = document.getElementById("totalStok");
    const bukuPilihan = document.getElementById("bukuPilihan");

    if (totalBuku) {
        totalBuku.textContent = daftarBahanAjar.length;
    }

    if (totalStok) {
        totalStok.textContent = daftarBahanAjar.reduce(
            function (total, buku) {
                return total + Number(buku.stok || 0);
            },
            0
        ).toLocaleString("id-ID");
    }

    if (bukuPilihan) {
        const pilihan = daftarBahanAjar.slice(0, 3);

        if (pilihan.length === 0) {
            bukuPilihan.innerHTML =
                '<p class="empty-state">Belum ada data bahan ajar. Pastikan data sudah dimasukkan ke Supabase.</p>';
        } else {
            bukuPilihan.innerHTML = pilihan.map(function (buku) {
                return `
                    <article class="book-card">
                        <div class="book-cover">
                            <span>${escapeHTML(buku.jenisBarang || "BMP")}</span>
                        </div>
                        <div class="book-info">
                            <h3>${escapeHTML(buku.namaBarang)}</h3>
                            <p>Kode: ${escapeHTML(buku.kodeBarang)}</p>
                            <p>Edisi: ${escapeHTML(buku.edisi || "-")}</p>
                            <p>Stok: ${Number(buku.stok).toLocaleString("id-ID")}</p>
                        </div>
                    </article>
                `;
            }).join("");
        }
    }
}

// ================================================
// 7. KATALOG DAN PENCARIAN
// ================================================

function pasangPencarianBuku() {
    const kolomCari = document.getElementById("cariBuku");
    const filterJenis = document.getElementById("filterJenis");

    if (kolomCari) {
        kolomCari.addEventListener("input", tampilkanKatalog);
    }

    if (filterJenis) {
        filterJenis.addEventListener("change", tampilkanKatalog);
    }
}

function tampilkanKatalog() {
    const tabel = document.getElementById("tabelBuku");
    const jumlahHasil = document.getElementById("jumlahHasil");

    if (!tabel) return;

    const kolomCari = document.getElementById("cariBuku");
    const filterJenis = document.getElementById("filterJenis");

    const kataKunci = kolomCari
        ? kolomCari.value.trim().toLowerCase()
        : "";

    const jenisTerpilih = filterJenis
        ? filterJenis.value
        : "";

    const hasil = daftarBahanAjar.filter(function (buku) {
        const cocokKataKunci =
            String(buku.kodeBarang || "").toLowerCase().includes(kataKunci) ||
            String(buku.namaBarang || "").toLowerCase().includes(kataKunci) ||
            String(buku.kodeLokasi || "").toLowerCase().includes(kataKunci);

        const cocokJenis =
            jenisTerpilih === "" ||
            buku.jenisBarang === jenisTerpilih;

        return cocokKataKunci && cocokJenis;
    });

    if (jumlahHasil) {
        jumlahHasil.textContent =
            hasil.length + " bahan ajar ditemukan";
    }

    if (hasil.length === 0) {
        tabel.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    Tidak ada bahan ajar yang sesuai.
                </td>
            </tr>
        `;
        return;
    }

    tabel.innerHTML = hasil.map(function (buku) {
        let statusStok = "Tersedia";
        let kelasStatus = "status";

        if (buku.stok <= 0) {
            statusStok = "Stok Habis";
            kelasStatus += " empty";
        } else if (buku.stok <= 20) {
            statusStok = "Stok Terbatas";
            kelasStatus += " warning";
        }

        return `
            <tr>
                <td>${escapeHTML(buku.kodeLokasi || "-")}</td>
                <td>${escapeHTML(buku.kodeBarang)}</td>
                <td>${escapeHTML(buku.namaBarang)}</td>
                <td>${escapeHTML(buku.jenisBarang || "-")}</td>
                <td>${escapeHTML(buku.edisi || "-")}</td>
                <td>${Number(buku.stok).toLocaleString("id-ID")}</td>
                <td><span class="${kelasStatus}">${statusStok}</span></td>
            </tr>
        `;
    }).join("");
}

// ================================================
// 8. PILIHAN BAHAN AJAR UNTUK PEMESANAN
// ================================================

function isiPilihanBuku() {
    const pilihan = document.getElementById("pilihBuku");

    if (!pilihan) return;

    const nilaiSebelumnya = pilihan.value;

    pilihan.innerHTML = '<option value="">-- Pilih bahan ajar --</option>';

    daftarBahanAjar.forEach(function (buku) {
        const opsi = document.createElement("option");

        opsi.value = buku.kodeBarang;
        opsi.textContent =
            buku.kodeBarang + " - " + buku.namaBarang +
            " (Stok: " + buku.stok + ")";

        if (buku.stok <= 0) {
            opsi.disabled = true;
        }

        pilihan.appendChild(opsi);
    });

    if (
        nilaiSebelumnya &&
        daftarBahanAjar.some(function (buku) {
            return buku.kodeBarang === nilaiSebelumnya && buku.stok > 0;
        })
    ) {
        pilihan.value = nilaiSebelumnya;
    }
}

// ================================================
// 9. TRACKING PENGIRIMAN
// ================================================

function pasangFormTracking() {
    const form = document.getElementById("formTracking");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        const inputNomor = document.getElementById("nomorDO");
        const hasil = document.getElementById("hasilTracking");

        const nomorDO = inputNomor
            ? inputNomor.value.trim()
            : "";

        if (!nomorDO) {
            tampilkanNotifikasi(
                "Masukkan nomor delivery order (DO) terlebih dahulu.",
                "error"
            );
            return;
        }

        if (!sittaDB) {
            tampilkanNotifikasi(
                "Database belum terhubung. Tracking belum dapat dilakukan.",
                "error"
            );
            return;
        }

        if (hasil) {
            hasil.innerHTML =
                '<p class="loading-state">Memeriksa data pengiriman...</p>';
        }

        const { data: dataTracking, error: errorTracking } = await sittaDB
            .from("tracking")
            .select("*")
            .eq("nomor_do", nomorDO)
            .maybeSingle();

        if (errorTracking) {
            console.error("Kesalahan pencarian tracking:", errorTracking);

            if (hasil) {
                hasil.innerHTML =
                    '<p class="error-message">Data tracking gagal diambil. Periksa konfigurasi tabel dan akses Supabase.</p>';
            }
            return;
        }

        if (!dataTracking) {
            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Data tidak ditemukan</h3>
                        <p>Nomor DO <strong>${escapeHTML(nomorDO)}</strong> tidak ditemukan dalam database.</p>
                    </div>
                `;
            }
            return;
        }

        const { data: riwayat, error: errorRiwayat } = await sittaDB
            .from("tracking_detail")
            .select("*")
            .eq("nomor_do", nomorDO)
            .order("waktu", { ascending: true });

        if (errorRiwayat) {
            console.error("Kesalahan riwayat tracking:", errorRiwayat);

            if (hasil) {
                hasil.innerHTML =
                    '<p class="error-message">Data pengiriman ditemukan, tetapi riwayat perjalanan gagal dimuat.</p>';
            }
            return;
        }

        tampilkanHasilTracking(dataTracking, riwayat || [], hasil);
    });
}

function tampilkanHasilTracking(data, riwayat, elemenHasil) {
    if (!elemenHasil) return;

    const tanggal = data.tanggal_kirim
        ? formatTanggal(data.tanggal_kirim)
        : "-";

    let daftarRiwayat = "";

    if (riwayat.length > 0) {
        daftarRiwayat = riwayat.map(function (item) {
            return `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <strong>${escapeHTML(formatTanggalWaktu(item.waktu))}</strong>
                        <p>${escapeHTML(item.keterangan)}</p>
                    </div>
                </div>
            `;
        }).join("");
    } else {
        daftarRiwayat =
            '<p class="empty-state">Belum ada riwayat perjalanan untuk nomor DO ini.</p>';
    }

    elemenHasil.innerHTML = `
        <div class="result-card">
            <h3>Informasi Pengiriman</h3>

            <div class="result-grid">
                <div>
                    <span>Nomor DO</span>
                    <strong>${escapeHTML(data.nomor_do)}</strong>
                </div>
                <div>
                    <span>Nama Penerima</span>
                    <strong>${escapeHTML(data.nama)}</strong>
                </div>
                <div>
                    <span>Status</span>
                    <strong>${escapeHTML(data.status)}</strong>
                </div>
                <div>
                    <span>Ekspedisi</span>
                    <strong>${escapeHTML(data.ekspedisi)}</strong>
                </div>
                <div>
                    <span>Tanggal Kirim</span>
                    <strong>${escapeHTML(tanggal)}</strong>
                </div>
                <div>
                    <span>Kode Paket</span>
                    <strong>${escapeHTML(data.paket || "-")}</strong>
                </div>
                <div>
                    <span>Total</span>
                    <strong>${escapeHTML(data.total || "-")}</strong>
                </div>
            </div>

            <h3>Riwayat Perjalanan</h3>
            <div class="timeline">${daftarRiwayat}</div>
        </div>
    `;
}

// ================================================
// 10. FORM PEMESANAN
// ================================================

function pasangFormPemesanan() {
    const form = document.getElementById("formPemesanan");

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        const nama = document.getElementById("namaPemesan").value.trim();
        const email = document.getElementById("emailPemesan").value.trim();
        const kodeBarang = document.getElementById("pilihBuku").value;
        const jumlah = Number(document.getElementById("jumlahBuku").value);
        const catatan = document.getElementById("catatan").value.trim();
        const hasil = document.getElementById("hasilPemesanan");

        if (!nama || !email || !kodeBarang || !Number.isInteger(jumlah) || jumlah < 1) {
            tampilkanNotifikasi(
                "Lengkapi nama, email, bahan ajar, dan jumlah pesanan dengan benar.",
                "error"
            );
            return;
        }

        const bukuDipilih = daftarBahanAjar.find(function (buku) {
            return buku.kodeBarang === kodeBarang;
        });

        if (!bukuDipilih) {
            tampilkanNotifikasi(
                "Bahan ajar yang dipilih tidak ditemukan. Muat ulang katalog dan coba kembali.",
                "error"
            );
            return;
        }

        if (jumlah > bukuDipilih.stok) {
            tampilkanNotifikasi(
                "Jumlah pesanan melebihi stok yang tersedia.",
                "error"
            );
            return;
        }

        if (!sittaDB) {
            tampilkanNotifikasi(
                "Database belum terhubung. Pesanan belum dapat disimpan.",
                "error"
            );
            return;
        }

        const tombolKirim = form.querySelector('[type="submit"]');

        if (tombolKirim) {
            tombolKirim.disabled = true;
            tombolKirim.textContent = "Menyimpan...";
        }

        try {
            const nomorPesanan = buatNomorPesanan();

            const { error } = await sittaDB
                .from("pemesanan")
                .insert({
                    nomor_pesanan: nomorPesanan,
                    nama_pemesan: nama,
                    email: email,
                    kode_barang: kodeBarang,
                    jumlah: jumlah,
                    catatan: catatan || null
                });

            if (error) {
                console.error("Gagal menyimpan pesanan:", error);

                tampilkanNotifikasi(
                    "Pesanan gagal disimpan. Pastikan tabel pemesanan dan kebijakan INSERT sudah dibuat di Supabase.",
                    "error"
                );

                if (hasil) {
                    hasil.innerHTML =
                        '<p class="error-message">Pesanan belum tersimpan. Silakan periksa konfigurasi database lalu coba kembali.</p>';
                }

                return;
            }

            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Pesanan Berhasil Disimpan</h3>
                        <p>Nomor pesanan: <strong>${escapeHTML(nomorPesanan)}</strong></p>
                        <p>Nama pemesan: ${escapeHTML(nama)}</p>
                        <p>Email: ${escapeHTML(email)}</p>
                        <p>Bahan ajar: ${escapeHTML(bukuDipilih.namaBarang)}</p>
                        <p>Jumlah: ${jumlah}</p>
                        <p>Catatan: ${escapeHTML(catatan || "-")}</p>
                        <p class="success-message">
                            Data pesanan telah tersimpan di database.
                        </p>
                    </div>
                `;
            }

            tampilkanNotifikasi(
                "Pesanan berhasil disimpan ke database.",
                "success"
            );

            form.reset();
            isiPilihanBuku();
        } finally {
            if (tombolKirim) {
                tombolKirim.disabled = false;
                tombolKirim.textContent = "Kirim Pesanan";
            }
        }
    });
}

function buatNomorPesanan() {
    const waktu = Date.now().toString();
    const angkaAcak = Math.floor(1000 + Math.random() * 9000);

    return "SITTA-" + waktu + "-" + angkaAcak;
}

// ================================================
// 11. FORMAT TANGGAL
// ================================================

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

function formatTanggalWaktu(nilai) {
    if (!nilai) return "-";

    const tanggal = new Date(nilai);

    if (Number.isNaN(tanggal.getTime())) {
        return String(nilai);
    }

    return tanggal.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ================================================
// 12. KEAMANAN TAMPILAN HTML
// ================================================

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
