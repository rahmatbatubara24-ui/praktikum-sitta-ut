```javascript
// ============================================
// SITTA - SISTEM INFORMASI TATA BAHAN AJAR
// Praktikum STSI4209
// ============================================

// Menjalankan program setelah HTML selesai dimuat
document.addEventListener("DOMContentLoaded", function () {
    inisialisasiNavigasi();
    tampilkanDashboard();
    tampilkanKatalog();
    inisialisasiPencarian();
    inisialisasiTracking();
    inisialisasiPemesanan();
});

// ============================================
// 1. NAVIGASI HALAMAN
// ============================================

function inisialisasiNavigasi() {
    var tombolNavigasi = document.querySelectorAll(".nav-btn");

    tombolNavigasi.forEach(function (tombol) {
        tombol.addEventListener("click", function () {
            var namaHalaman = tombol.getAttribute("data-page");
            bukaHalaman(namaHalaman);
        });
    });
}

function bukaHalaman(namaHalaman) {
    var semuaHalaman = document.querySelectorAll(".page");
    var semuaTombol = document.querySelectorAll(".nav-btn");
    var halamanTujuan = document.getElementById(namaHalaman);

    if (!halamanTujuan) {
        tampilkanNotifikasi("Halaman tidak ditemukan.");
        return;
    }

    semuaHalaman.forEach(function (halaman) {
        halaman.classList.remove("active");
    });

    semuaTombol.forEach(function (tombol) {
        tombol.classList.remove("active");
    });

    halamanTujuan.classList.add("active");

    var tombolAktif = document.querySelector(
        '.nav-btn[data-page="' + namaHalaman + '"]'
    );

    if (tombolAktif) {
        tombolAktif.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ============================================
// 2. DASHBOARD
// ============================================

function tampilkanDashboard() {
    var elemenTotalBuku = document.getElementById("totalBuku");
    var elemenTotalStok = document.getElementById("totalStok");
    var elemenTotalTracking = document.getElementById("totalTracking");
    var elemenBukuPilihan = document.getElementById("bukuPilihan");

    var totalStok = dataBahanAjar.reduce(function (total, buku) {
        return total + Number(buku.stok);
    }, 0);

    if (elemenTotalBuku) {
        elemenTotalBuku.textContent = dataBahanAjar.length;
    }

    if (elemenTotalStok) {
        elemenTotalStok.textContent = totalStok.toLocaleString("id-ID");
    }

    if (elemenTotalTracking) {
        elemenTotalTracking.textContent =
            Object.keys(dataTracking).length;
    }

    if (elemenBukuPilihan) {
        elemenBukuPilihan.innerHTML = dataBahanAjar
            .slice(0, 3)
            .map(function (buku, indeks) {
                return buatKartuBuku(buku, indeks);
            })
            .join("");
    }
}

// ============================================
// 3. KARTU BAHAN AJAR
// ============================================

function buatKartuBuku(buku, indeks) {
    var kelasWarna = ["", "color-2", "color-3"][indeks % 3];

    return `
        <article class="book-card">
            <div class="book-cover ${kelasWarna}">
                <small>UNIVERSITAS TERBUKA · ${escapeHTML(buku.jenisBarang)}</small>
                <strong>${escapeHTML(buku.namaBarang)}</strong>
                <small>Kode: ${escapeHTML(buku.kodeBarang)}</small>
            </div>
            <div class="book-info">
                <span class="pill">${escapeHTML(buku.jenisBarang)}</span>
                <h3>${escapeHTML(buku.namaBarang)}</h3>
                <p>Kode lokasi: ${escapeHTML(buku.kodeLokasi)}</p>
                <p>Edisi: ${escapeHTML(buku.edisi)}</p>
                <p>Stok tersedia: <strong>${Number(buku.stok)}</strong></p>
                <button
                    type="button"
                    class="primary-btn"
                    onclick="pilihBuku('${escapeHTML(buku.kodeBarang)}')">
                    Pesan Bahan Ajar
                </button>
            </div>
        </article>
    `;
}

// ============================================
// 4. KATALOG BAHAN AJAR
// ============================================

function tampilkanKatalog(daftarBuku) {
    var tabelBuku = document.getElementById("tabelBuku");
    var jumlahHasil = document.getElementById("jumlahHasil");

    if (!tabelBuku) {
        return;
    }

    var daftar = daftarBuku || dataBahanAjar;

    if (jumlahHasil) {
        jumlahHasil.textContent =
            "Menampilkan " + daftar.length + " bahan ajar";
    }

    if (daftar.length === 0) {
        tabelBuku.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:25px;">
                    Data bahan ajar tidak ditemukan.
                </td>
            </tr>
        `;
        return;
    }

    tabelBuku.innerHTML = daftar.map(function (buku) {
        var statusStok = "";

        if (buku.stok <= 0) {
            statusStok = '<span class="status empty">Habis</span>';
        } else if (buku.stok < 200) {
            statusStok = '<span class="status warning">Stok Terbatas</span>';
        } else {
            statusStok = '<span class="status">Tersedia</span>';
        }

        return `
            <tr>
                <td>${escapeHTML(buku.kodeBarang)}</td>
                <td>${escapeHTML(buku.namaBarang)}</td>
                <td>${escapeHTML(buku.kodeLokasi)}</td>
                <td>${escapeHTML(buku.jenisBarang)}</td>
                <td>${escapeHTML(buku.edisi)}</td>
                <td>${Number(buku.stok).toLocaleString("id-ID")}</td>
                <td>${statusStok}</td>
            </tr>
        `;
    }).join("");
}

function inisialisasiPencarian() {
    var inputCari = document.getElementById("cariBuku");
    var filterJenis = document.getElementById("filterJenis");

    function prosesFilter() {
        var kataKunci = inputCari
            ? inputCari.value.trim().toLowerCase()
            : "";

        var jenisDipilih = filterJenis
            ? filterJenis.value
            : "";

        var hasilFilter = dataBahanAjar.filter(function (buku) {
            var cocokKata =
                buku.namaBarang.toLowerCase().includes(kataKunci) ||
                buku.kodeBarang.toLowerCase().includes(kataKunci) ||
                buku.kodeLokasi.toLowerCase().includes(kataKunci);

            var cocokJenis =
                !jenisDipilih ||
                jenisDipilih === "Semua" ||
                buku.jenisBarang === jenisDipilih;

            return cocokKata && cocokJenis;
        });

        tampilkanKatalog(hasilFilter);
    }

    if (inputCari) {
        inputCari.addEventListener("input", prosesFilter);
    }

    if (filterJenis) {
        filterJenis.addEventListener("change", prosesFilter);
    }
}

// ============================================
// 5. TRACKING PENGIRIMAN
// ============================================

function inisialisasiTracking() {
    var formTracking = document.getElementById("formTracking");

    if (!formTracking) {
        return;
    }

    formTracking.addEventListener("submit", function (event) {
        event.preventDefault();

        var inputNomorDO = document.getElementById("nomorDO");
        var nomorDO = inputNomorDO.value.trim();
        var hasilTracking = document.getElementById("hasilTracking");

        if (!nomorDO) {
            tampilkanHasilTracking(
                "Masukkan nomor DO terlebih dahulu.",
                true
            );
            return;
        }

        var data = dataTracking[nomorDO];

        if (!data) {
            tampilkanHasilTracking(
                "Nomor DO " + nomorDO +
                " tidak ditemukan. Periksa kembali nomor yang dimasukkan.",
                true
            );
            return;
        }

        var daftarPerjalanan = data.perjalanan.map(function (item) {
            return `
                <div class="timeline-item">
                    <strong>${escapeHTML(item.keterangan)}</strong>
                    <small>${escapeHTML(item.waktu)}</small>
                </div>
            `;
        }).join("");

        hasilTracking.innerHTML = `
            <div class="result-card">
                <h3>Informasi Pengiriman</h3>
                <p><strong>Nomor DO:</strong> ${escapeHTML(data.nomorDO)}</p>
                <p><strong>Nama penerima:</strong> ${escapeHTML(data.nama)}</p>
                <p><strong>Ekspedisi:</strong> ${escapeHTML(data.ekspedisi)}</p>
                <p><strong>Tanggal kirim:</strong> ${escapeHTML(data.tanggalKirim)}</p>
                <p><strong>Kode paket:</strong> ${escapeHTML(data.paket)}</p>
                <p><strong>Total:</strong> ${escapeHTML(data.total)}</p>
                <p>
                    <strong>Status:</strong>
                    <span class="status">${escapeHTML(data.status)}</span>
                </p>
                <h3>Riwayat Perjalanan</h3>
                <div class="timeline">${daftarPerjalanan}</div>
                <p class="muted">
                    Informasi ini menggunakan data simulasi praktikum.
                </p>
            </div>
        `;

        hasilTracking.style.display = "block";
    });
}

function tampilkanHasilTracking(pesan, terjadiKesalahan) {
    var hasil = document.getElementById("hasilTracking");

    if (!hasil) {
        return;
    }

    var kelas = terjadiKesalahan
        ? "error-message"
        : "success-message";

    hasil.innerHTML = `
        <div class="${kelas}">${escapeHTML(pesan)}</div>
    `;

    hasil.style.display = "block";
}

// ============================================
// 6. FORMULIR PEMESANAN
// ============================================

function inisialisasiPemesanan() {
    var formPemesanan = document.getElementById("formPemesanan");
    var pilihBukuSelect = document.getElementById("pilihBuku");

    if (pilihBukuSelect) {
        pilihBukuSelect.innerHTML =
            '<option value="">-- Pilih bahan ajar --</option>' +
            dataBahanAjar.map(function (buku) {
                return `
                    <option value="${escapeHTML(buku.kodeBarang)}">
                        ${escapeHTML(buku.kodeBarang)} - ${escapeHTML(buku.namaBarang)}
                        (Stok: ${Number(buku.stok)})
                    </option>
                `;
            }).join("");
    }

    if (!formPemesanan) {
        return;
    }

    formPemesanan.addEventListener("submit", function (event) {
        event.preventDefault();

        var nama = document.getElementById("namaPemesan").value.trim();
        var email = document.getElementById("emailPemesan").value.trim();
        var kodeBuku = document.getElementById("pilihBuku").value;
        var jumlah = Number(document.getElementById("jumlahBuku").value);
        var catatan = document.getElementById("catatan").value.trim();
        var hasil = document.getElementById("hasilPemesanan");

        if (!nama || !email || !kodeBuku || !jumlah) {
            tampilkanHasilPemesanan(
                "Lengkapi nama, email, bahan ajar, dan jumlah pesanan.",
                true
            );
            return;
        }

        var polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!polaEmail.test(email)) {
            tampilkanHasilPemesanan(
                "Format email belum benar. Periksa kembali email Anda.",
                true
            );
            return;
        }

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            tampilkanHasilPemesanan(
                "Jumlah pesanan harus berupa bilangan bulat minimal 1.",
                true
            );
            return;
        }

        var bukuDipilih = dataBahanAjar.find(function (buku) {
            return buku.kodeBarang === kodeBuku;
        });

        if (!bukuDipilih) {
            tampilkanHasilPemesanan(
                "Bahan ajar yang dipilih tidak ditemukan.",
                true
            );
            return;
        }

        if (jumlah > bukuDipilih.stok) {
            tampilkanHasilPemesanan(
                "Jumlah pesanan melebihi stok yang tersedia (" +
                bukuDipilih.stok + ").",
                true
            );
            return;
        }

        // Nomor pesanan simulasi untuk keperluan praktikum.
        var nomorPesanan = "ORD-" + Date.now().toString().slice(-8);

        hasil.innerHTML = `
            <div class="success-message">
                <h3>Pesanan Berhasil Dicatat!</h3>
                <p><strong>Nomor pesanan:</strong> ${nomorPesanan}</p>
                <p><strong>Nama pemesan:</strong> ${escapeHTML(nama)}</p>
                <p><strong>Email:</strong> ${escapeHTML(email)}</p>
                <p><strong>Kode bahan ajar:</strong> ${escapeHTML(bukuDipilih.kodeBarang)}</p>
                <p><strong>Nama bahan ajar:</strong> ${escapeHTML(bukuDipilih.namaBarang)}</p>
                <p><strong>Jumlah:</strong> ${jumlah}</p>
                <p><strong>Catatan:</strong> ${escapeHTML(catatan || "-")}</p>
                <p class="muted">
                    Ini adalah simulasi pemesanan. Data belum dikirim ke server
                    dan stok katalog belum dikurangi.
                </p>
            </div>
        `;

        hasil.style.display = "block";
        tampilkanNotifikasi("Simulasi pesanan berhasil dibuat.");
        formPemesanan.reset();
    });
}

function pilihBuku(kodeBarang) {
    var selectBuku = document.getElementById("pilihBuku");

    if (!selectBuku) {
        return;
    }

    selectBuku.value = kodeBarang;
    bukaHalaman("pemesanan");
    tampilkanNotifikasi("Bahan ajar dipilih. Lengkapi formulir pemesanan.");
}

// ============================================
// 7. NOTIFIKASI
// ============================================

function tampilkanNotifikasi(pesan) {
    var notifikasi = document.getElementById("notifikasi");

    if (!notifikasi) {
        return;
    }

    notifikasi.textContent = pesan;
    notifikasi.style.display = "block";

    // Menyembunyikan notifikasi setelah 3 detik.
    window.setTimeout(function () {
        notifikasi.style.display = "none";
    }, 3000);
}

function tampilkanHasilPemesanan(pesan, terjadiKesalahan) {
    var hasil = document.getElementById("hasilPemesanan");

    if (!hasil) {
        return;
    }

    hasil.innerHTML = `
        <div class="${terjadiKesalahan ? "error-message" : "success-message"}">
            ${escapeHTML(pesan)}
        </div>
    `;

    hasil.style.display = "block";
}

// ============================================
// 8. KEAMANAN DASAR TAMPILAN
// Mencegah teks input diperlakukan sebagai HTML
// ============================================

function escapeHTML(nilai) {
    return String(nilai == null ? "" : nilai).replace(/[&<>"']/g, function (karakter) {
        var pengganti = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return pengganti[karakter];
    });
}
```
