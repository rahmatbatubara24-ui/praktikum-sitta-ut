```javascript
/*
=====================================================
 SITTA - SISTEM INFORMASI TATA BAHAN AJAR
 Tugas Praktik 1 STSI4209
 Sumber data: data.js (tanpa backend)
=====================================================
*/

let daftarBahanAjar = [];
let daftarPesanan = [];

// ===================================================
// 1. MEMULAI APLIKASI
// ===================================================

document.addEventListener("DOMContentLoaded", function () {
    // Ambil data lokal dari data.js
    if (typeof dataBahanAjar !== "undefined") {
        daftarBahanAjar = dataBahanAjar.map(function (item) {
            return {
                kode: item.kodeBarang,
                kodeLokasi: item.kodeLokasi,
                judul: item.namaBarang,
                jenis: item.jenisBarang,
                edisi: item.edisi,
                stok: Number(item.stok) || 0,
                cover: item.cover
            };
        });
    }

    pasangNavigasi();
    pasangPencarian();
    pasangFormPemesanan();
    pasangFormTracking();

    tampilkanKatalog();
    isiPilihanBahanAjar();
    perbaruiDashboard();

    const pesanAwal = document.getElementById("bukuPilihan");
    if (pesanAwal && daftarBahanAjar.length === 0) {
        pesanAwal.innerHTML =
            '<p class="empty-state">Data bahan ajar tidak ditemukan. Periksa pemanggilan data.js.</p>';
    }
});

// ===================================================
// 2. NAVIGASI HALAMAN
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

    if (idHalaman === "katalog") tampilkanKatalog();
    if (idHalaman === "pemesanan") isiPilihanBahanAjar();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===================================================
// 3. NOTIFIKASI
// ===================================================

function tampilkanNotifikasi(pesan, jenis = "info") {
    const elemen = document.getElementById("notifikasi");

    if (!elemen) {
        alert(pesan);
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
    elemen.style.display = "block";

    // Hilangkan notifikasi otomatis setelah 4 detik
    window.clearTimeout(elemen._timer);
    elemen._timer = window.setTimeout(function () {
        elemen.hidden = true;
        elemen.style.display = "none";
    }, 4000);
}

function sembunyikanNotifikasi() {
    const elemen = document.getElementById("notifikasi");

    if (elemen) {
        elemen.hidden = true;
        elemen.style.display = "none";
        elemen.textContent = "";
    }
}

// ===================================================
// 4. DASHBOARD
// ===================================================

function perbaruiDashboard() {
    const elemenBuku = document.getElementById("totalBuku");
    const elemenStok = document.getElementById("totalStok");
    const elemenTracking = document.getElementById("totalTracking");
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

    if (elemenTracking) {
        elemenTracking.textContent =
            typeof dataTracking !== "undefined"
                ? Object.keys(dataTracking).length
                : 0;
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
                        <p>Lokasi: ${escapeHTML(buku.kodeLokasi)}</p>
                        <p>Jenis: ${escapeHTML(buku.jenis)}</p>
                        <p>Edisi: ${escapeHTML(buku.edisi)}</p>
                        <p>Stok: ${buku.stok.toLocaleString("id-ID")}</p>
                    </div>
                </article>
            `;
        }).join("");
}

// ===================================================
// 5. KATALOG BAHAN AJAR
// ===================================================

function pasangPencarian() {
    const kolomCari = document.getElementById("cariBuku");

    if (kolomCari) {
        kolomCari.addEventListener("input", tampilkanKatalog);
    }

    const filterJenis = document.getElementById("filterJenis");

    if (filterJenis) {
        filterJenis.disabled = false;
        filterJenis.addEventListener("change", tampilkanKatalog);
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

    const filterJenis = document.getElementById("filterJenis");
    const jenisDipilih = filterJenis ? filterJenis.value : "";

    const hasil = daftarBahanAjar.filter(function (buku) {
        const cocokKata =
            buku.kode.toLowerCase().includes(kataKunci) ||
            buku.judul.toLowerCase().includes(kataKunci) ||
            buku.kodeLokasi.toLowerCase().includes(kataKunci);

        const cocokJenis =
            !jenisDipilih || buku.jenis === jenisDipilih;

        return cocokKata && cocokJenis;
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
        } else if (buku.stok <= 200) {
            status = "Stok Terbatas";
            kelas += " warning";
        }

        return `
            <tr>
                <td>${escapeHTML(buku.kode)}</td>
                <td>${escapeHTML(buku.judul)}</td>
                <td>${escapeHTML(buku.kodeLokasi)}</td>
                <td>${escapeHTML(buku.jenis)}</td>
                <td>${escapeHTML(buku.edisi)}</td>
                <td>${buku.stok.toLocaleString("id-ID")}</td>
                <td>
                    <span class="${kelas}">${status}</span>
                    <button type="button"
                        class="btn-pesan"
                        data-pilih-buku="${escapeHTML(buku.kode)}"
                        ${buku.stok <= 0 ? "disabled" : ""}>
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
            if (pilihan) pilihan.value = kode;
        });
    });
}

// ===================================================
// 6. PILIHAN BAHAN AJAR PADA FORM PEMESANAN
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
// 7. PEMESANAN SIMULASI FRONT-END
// Tidak menyimpan data ke database
// ===================================================

function pasangFormPemesanan() {
    const form = document.getElementById("formPemesanan");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        const nama = document.getElementById("namaPemesan").value.trim();
        const email = document.getElementById("emailPemesan").value.trim();
        const kode = document.getElementById("pilihBuku").value;
        const jumlah = Number(document.getElementById("jumlahBuku").value);
        const catatan = document.getElementById("catatan").value.trim();

        if (!nama || !email || !kode ||
            !Number.isInteger(jumlah) || jumlah < 1) {
            tampilkanNotifikasi(
                "Lengkapi formulir dengan benar.",
                "error"
            );
            return;
        }

        const buku = daftarBahanAjar.find(function (item) {
            return item.kode === kode;
        });

        if (!buku) {
            tampilkanNotifikasi("Bahan ajar tidak ditemukan.", "error");
            return;
        }

        if (jumlah > buku.stok) {
            tampilkanNotifikasi(
                "Jumlah pesanan melebihi stok yang tersedia.",
                "error"
            );
            return;
        }

        const nomorPesanan =
            "ST" + Date.now().toString().slice(-10);

        const pesanan = {
            nomorPesanan: nomorPesanan,
            nama: nama,
            email: email,
            kode: buku.kode,
            judul: buku.judul,
            jumlah: jumlah,
            catatan: catatan,
            status: "Menunggu"
        };

        daftarPesanan.push(pesanan);

        const hasil = document.getElementById("hasilPemesanan");

        if (hasil) {
            hasil.innerHTML = `
                <div class="result-card">
                    <h3>Pesanan Berhasil Dicatat</h3>
                    <p>Nomor pesanan:
                        <strong>${escapeHTML(nomorPesanan)}</strong>
                    </p>
                    <p>Nama pemesan: ${escapeHTML(nama)}</p>
                    <p>Bahan ajar: ${escapeHTML(buku.judul)}</p>
                    <p>Kode: ${escapeHTML(buku.kode)}</p>
                    <p>Jumlah: ${jumlah}</p>
                    <p>Status: <strong>Menunggu</strong></p>
                    <p>Catatan: ${escapeHTML(catatan || "-")}</p>
                    <p class="success-message">
                        Ini merupakan simulasi front-end untuk tugas praktikum.
                    </p>
                </div>
            `;
        }

        tampilkanNotifikasi(
            "Pesanan simulasi berhasil dicatat.",
            "success"
        );

        form.reset();
        isiPilihanBahanAjar();
    });
}

// ===================================================
// 8. TRACKING DELIVERY ORDER DARI DATA.JS
// ===================================================

function pasangFormTracking() {
    const form = document.getElementById("formTracking");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        sembunyikanNotifikasi();

        const input = document.getElementById("nomorDO");
        const hasil = document.getElementById("hasilTracking");
        const nomor = input ? input.value.trim() : "";

        if (!nomor) {
            tampilkanNotifikasi(
                "Masukkan nomor Delivery Order terlebih dahulu.",
                "error"
            );
            return;
        }

        const data =
            typeof dataTracking !== "undefined"
                ? dataTracking[nomor]
                : null;

        if (!data) {
            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Data Tidak Ditemukan</h3>
                        <p>Nomor DO <strong>${escapeHTML(nomor)}</strong>
                        tidak terdapat dalam data praktikum.</p>
                        <p>Coba nomor DO: 2023001234 atau 2023005678.</p>
                    </div>
                `;
            }
            return;
        }

        const daftarPerjalanan = (data.perjalanan || []).map(function (item) {
            return `
                <li>
                    <strong>${escapeHTML(item.waktu)}</strong>
                    <p>${escapeHTML(item.keterangan)}</p>
                </li>
            `;
        }).join("");

        if (hasil) {
            hasil.innerHTML = `
                <div class="result-card">
                    <h3>Informasi Pengiriman</h3>
                    <div class="result-grid">
                        <div>
                            <span>Nomor DO</span>
                            <strong>${escapeHTML(data.nomorDO)}</strong>
                        </div>
                        <div>
                            <span>Nama Mahasiswa</span>
                            <strong>${escapeHTML(data.nama)}</strong>
                        </div>
                        <div>
                            <span>Status Pengiriman</span>
                            <strong>${escapeHTML(data.status)}</strong>
                        </div>
                        <div>
                            <span>Ekspedisi</span>
                            <strong>${escapeHTML(data.ekspedisi)}</strong>
                        </div>
                        <div>
                            <span>Tanggal Kirim</span>
                            <strong>${escapeHTML(data.tanggalKirim)}</strong>
                        </div>
                        <div>
                            <span>Jenis/Kode Paket</span>
                            <strong>${escapeHTML(data.paket)}</strong>
                        </div>
                        <div>
                            <span>Total Pembayaran</span>
                            <strong>${escapeHTML(data.total)}</strong>
                        </div>
                    </div>

                    <h4>Riwayat Perjalanan</h4>
                    <ol class="tracking-history">
                        ${daftarPerjalanan}
                    </ol>
                </div>
            `;
        }
    });
}

// ===================================================
// 9. UTILITAS
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
