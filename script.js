```javascript
/*
=====================================================
 SITTA - SISTEM INFORMASI TATA BAHAN AJAR
 Tugas Praktik 1 STSI4209
 Data sumber: data.js
 Tanpa backend
=====================================================
*/

let daftarBahanAjar = [];
let daftarPesanan = [];
let penggunaAktif = null;

// ===================================================
// 1. INISIALISASI APLIKASI
// ===================================================

document.addEventListener("DOMContentLoaded", function () {
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

    buatTampilanLogin();
    pasangNavigasi();
    pasangPencarian();
    pasangFormPemesanan();
    pasangFormTracking();

    tampilkanKatalog();
    isiPilihanBahanAjar();
    perbaruiDashboard();
});

// ===================================================
// 2. TAMPILAN LOGIN
// ===================================================

function buatTampilanLogin() {
    const gaya = document.createElement("style");

    gaya.textContent = `
        #sittaLogin {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(135deg, #123d75, #2879b9);
            font-family: Arial, sans-serif;
            overflow-y: auto;
        }

        #sittaLogin .login-card {
            width: 100%;
            max-width: 410px;
            padding: 30px;
            background: white;
            border-radius: 18px;
            box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        #sittaLogin .login-logo {
            width: 66px;
            height: 66px;
            margin: 0 auto 12px;
            border-radius: 16px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #174a83;
            color: white;
            font-size: 25px;
            font-weight: bold;
        }

        #sittaLogin h1 {
            margin: 8px 0;
            text-align: center;
            color: #174a83;
            font-size: 25px;
        }

        #sittaLogin .login-desc {
            text-align: center;
            color: #64748b;
            margin-bottom: 25px;
        }

        #sittaLogin label,
        #sittaModal label {
            display: block;
            margin: 12px 0 6px;
            font-weight: bold;
            color: #334155;
        }

        #sittaLogin input,
        #sittaModal input {
            box-sizing: border-box;
            width: 100%;
            padding: 12px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 15px;
        }

        #sittaLogin input:focus,
        #sittaModal input:focus {
            outline: 2px solid #93c5fd;
            border-color: #2563eb;
        }

        #sittaLogin .login-button {
            width: 100%;
            margin-top: 20px;
            padding: 13px;
            border: 0;
            border-radius: 8px;
            color: white;
            background: #174a83;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }

        #sittaLogin .login-button:hover {
            background: #2563a5;
        }

        #sittaLogin .login-links {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-top: 17px;
        }

        #sittaLogin .login-links button {
            border: 0;
            background: none;
            color: #1d5d9d;
            cursor: pointer;
            font-weight: bold;
            padding: 6px 0;
        }

        #sittaLogin .login-help {
            margin-top: 20px;
            padding: 12px;
            background: #eff6ff;
            color: #334155;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.7;
        }

        #sittaModal {
            position: fixed;
            inset: 0;
            z-index: 100000;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: rgba(15,23,42,.65);
            font-family: Arial, sans-serif;
        }

        #sittaModal .modal-card {
            width: 100%;
            max-width: 430px;
            max-height: 90vh;
            overflow-y: auto;
            box-sizing: border-box;
            padding: 25px;
            background: white;
            border-radius: 14px;
            box-shadow: 0 15px 45px rgba(0,0,0,.2);
        }

        #sittaModal .modal-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        #sittaModal h2 {
            margin: 0;
            color: #174a83;
        }

        #sittaModal .modal-close {
            border: 0;
            background: #e2e8f0;
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
        }

        #sittaModal .modal-action {
            width: 100%;
            margin-top: 18px;
            padding: 12px;
            border: 0;
            border-radius: 8px;
            background: #174a83;
            color: white;
            font-weight: bold;
            cursor: pointer;
        }

        #sittaModal .modal-note {
            color: #64748b;
            font-size: 13px;
            line-height: 1.6;
        }

        .sitta-user-info {
            margin: 0 10px;
            color: inherit;
            font-size: 13px;
        }

        .sitta-logout {
            cursor: pointer;
        }
    `;

    document.head.appendChild(gaya);

    const login = document.createElement("div");
    login.id = "sittaLogin";

    login.innerHTML = `
        <div class="login-card">
            <div class="login-logo">UT</div>
            <h1>SITTA</h1>
            <p class="login-desc">
                Sistem Informasi Tata Bahan Ajar
                Universitas Terbuka
            </p>

            <form id="formLogin">
                <label for="loginEmail">Email</label>
                <input
                    type="email"
                    id="loginEmail"
                    placeholder="Masukkan email"
                    autocomplete="username"
                    required
                >

                <label for="loginPassword">Password</label>
                <input
                    type="password"
                    id="loginPassword"
                    placeholder="Masukkan password"
                    autocomplete="current-password"
                    required
                >

                <button class="login-button" type="submit">
                    Login
                </button>
            </form>

            <div class="login-links">
                <button type="button" id="btnLupaPassword">
                    Lupa Password
                </button>
                <button type="button" id="btnDaftar">
                    Daftar
                </button>
            </div>

            <div class="login-help">
                <strong>Akun uji dari data dosen:</strong><br>
                Email: rina@ut.ac.id<br>
                Password: rina123
            </div>
        </div>
    `;

    document.body.appendChild(login);

    const modal = document.createElement("div");
    modal.id = "sittaModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-heading">
                <h2 id="sittaModalTitle">Informasi</h2>
                <button type="button" class="modal-close"
                    id="btnTutupModal">Tutup</button>
            </div>
            <div id="sittaModalIsi"></div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("formLogin").addEventListener(
        "submit",
        prosesLogin
    );

    document.getElementById("btnLupaPassword").addEventListener(
        "click",
        tampilkanModalLupaPassword
    );

    document.getElementById("btnDaftar").addEventListener(
        "click",
        tampilkanModalDaftar
    );

    document.getElementById("btnTutupModal").addEventListener(
        "click",
        tutupModal
    );

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            tutupModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            tutupModal();
        }
    });

    kunciAplikasi(true);
}

function kunciAplikasi(terkunci) {
    const login = document.getElementById("sittaLogin");
    const header = document.querySelector("header.header");
    const main = document.querySelector("main.container");
    const footer = document.querySelector("body > footer");

    if (login) {
        login.style.display = terkunci ? "flex" : "none";
    }

    [header, main, footer].forEach(function (elemen) {
        if (elemen) {
            elemen.style.display = terkunci ? "none" : "";
        }
    });
}

// ===================================================
// 3. PROSES LOGIN DARI DATA DOSEN
// ===================================================

function prosesLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail")
        .value.trim().toLowerCase();

    const password = document.getElementById("loginPassword").value;

    const pengguna = typeof dataPengguna !== "undefined"
        ? dataPengguna.find(function (item) {
            return item.email.toLowerCase() === email &&
                   item.password === password;
        })
        : null;

    if (!pengguna) {
        alert("email/password yang anda masukkan salah");
        return;
    }

    penggunaAktif = pengguna;
    kunciAplikasi(false);

    const sambutan = document.querySelector(".welcome h1");

    if (sambutan) {
        sambutan.textContent =
            "Selamat Datang, " + pengguna.nama;
    }

    const deskripsi = document.querySelector(".welcome p");

    if (deskripsi) {
        deskripsi.textContent =
            "SITTA | " + pengguna.role + " | " + pengguna.lokasi;
    }

    tampilkanIdentitasPengguna();
    bukaHalaman("dashboard");
    perbaruiDashboard();
}

function tampilkanIdentitasPengguna() {
    const nav = document.querySelector("header nav");

    if (!nav || !penggunaAktif) return;

    let info = document.getElementById("sittaInfoPengguna");

    if (!info) {
        info = document.createElement("span");
        info.id = "sittaInfoPengguna";
        info.className = "sitta-user-info";
        nav.appendChild(info);
    }

    info.textContent =
        penggunaAktif.nama + " (" + penggunaAktif.role + ")";

    let keluar = document.getElementById("sittaLogout");

    if (!keluar) {
        keluar = document.createElement("button");
        keluar.type = "button";
        keluar.id = "sittaLogout";
        keluar.className = "nav-btn sitta-logout";
        keluar.textContent = "Keluar";
        nav.appendChild(keluar);

        keluar.addEventListener("click", function () {
            penggunaAktif = null;

            const infoPengguna =
                document.getElementById("sittaInfoPengguna");

            if (infoPengguna) infoPengguna.remove();
            keluar.remove();

            const form = document.getElementById("formLogin");
            if (form) form.reset();

            kunciAplikasi(true);
        });
    }
}

// ===================================================
// 4. MODAL LUPA PASSWORD
// ===================================================

function tampilkanModalLupaPassword() {
    document.getElementById("sittaModalTitle").textContent =
        "Lupa Password";

    document.getElementById("sittaModalIsi").innerHTML = `
        <p class="modal-note">
            Masukkan email yang terdaftar. Pada tugas praktikum ini,
            fitur pemulihan password merupakan simulasi karena aplikasi
            tidak menggunakan backend.
        </p>

        <form id="formLupaPassword">
            <label for="lupaEmail">Email</label>
            <input type="email" id="lupaEmail"
                placeholder="Masukkan email terdaftar" required>

            <button class="modal-action" type="submit">
                Periksa Email
            </button>
        </form>
    `;

    bukaModal();

    document.getElementById("formLupaPassword").addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const email = document.getElementById("lupaEmail")
                .value.trim().toLowerCase();

            const pengguna = typeof dataPengguna !== "undefined"
                ? dataPengguna.find(function (item) {
                    return item.email.toLowerCase() === email;
                })
                : null;

            if (pengguna) {
                alert(
                    "Email terdaftar. Pemulihan password sebenarnya " +
                    "memerlukan layanan backend."
                );
            } else {
                alert("Email tidak ditemukan dalam data pengguna.");
            }

            tutupModal();
        }
    );
}

// ===================================================
// 5. MODAL DAFTAR
// ===================================================

function tampilkanModalDaftar() {
    document.getElementById("sittaModalTitle").textContent =
        "Daftar Pengguna";

    document.getElementById("sittaModalIsi").innerHTML = `
        <p class="modal-note">
            Pendaftaran ini hanya simulasi. Data pengguna baru tidak
            disimpan permanen dan tidak ditambahkan ke data dosen.
        </p>

        <form id="formDaftar">
            <label for="daftarNama">Nama Lengkap</label>
            <input type="text" id="daftarNama"
                maxlength="100" required>

            <label for="daftarEmail">Email</label>
            <input type="email" id="daftarEmail"
                maxlength="254" required>

            <label for="daftarPassword">Password</label>
            <input type="password" id="daftarPassword"
                minlength="6" required>

            <button class="modal-action" type="submit">
                Daftar
            </button>
        </form>
    `;

    bukaModal();

    document.getElementById("formDaftar").addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const nama = document.getElementById("daftarNama")
                .value.trim();

            const email = document.getElementById("daftarEmail")
                .value.trim().toLowerCase();

            const password = document.getElementById("daftarPassword")
                .value;

            const emailSudahAda = typeof dataPengguna !== "undefined" &&
                dataPengguna.some(function (item) {
                    return item.email.toLowerCase() === email;
                });

            if (emailSudahAda) {
                alert("Email sudah terdaftar. Silakan login.");
                return;
            }

            if (!nama || !email || password.length < 6) {
                alert("Lengkapi data dengan benar. Password minimal 6 karakter.");
                return;
            }

            alert(
                "Formulir pendaftaran berhasil diperiksa. " +
                "Pendaftaran permanen memerlukan backend."
            );

            tutupModal();
        }
    );
}

function bukaModal() {
    document.getElementById("sittaModal").style.display = "flex";
}

function tutupModal() {
    const modal = document.getElementById("sittaModal");

    if (modal) {
        modal.style.display = "none";
    }
}

// ===================================================
// 6. NAVIGASI
// ===================================================

function pasangNavigasi() {
    document.querySelectorAll(".nav-btn[data-page]").forEach(
        function (tombol) {
            tombol.addEventListener("click", function () {
                bukaHalaman(tombol.dataset.page);
            });
        }
    );

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

    document.querySelectorAll(".nav-btn[data-page]").forEach(
        function (tombol) {
            tombol.classList.toggle(
                "active",
                tombol.dataset.page === idHalaman
            );
        }
    );

    if (idHalaman === "katalog") tampilkanKatalog();
    if (idHalaman === "pemesanan") isiPilihanBahanAjar();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===================================================
// 7. NOTIFIKASI
// ===================================================

function tampilkanNotifikasi(pesan, jenis) {
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
// 8. DASHBOARD
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
            "<p>Data bahan ajar belum tersedia. Periksa data.js.</p>";
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
// 9. KATALOG BAHAN AJAR
// ===================================================

function pasangPencarian() {
    const kolomCari = document.getElementById("cariBuku");

    if (kolomCari) {
        kolomCari.addEventListener("input", tampilkanKatalog);
    }

    const filterJenis = document.getElementById("filterJenis");

    if (filterJenis) {
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

        return cocokKata &&
            (!jenisDipilih || buku.jenis === jenisDipilih);
    });

    if (jumlahHasil) {
        jumlahHasil.textContent =
            hasil.length + " bahan ajar ditemukan";
    }

    if (hasil.length === 0) {
        tabel.innerHTML = `
            <tr><td colspan="7">
                Tidak ada bahan ajar yang ditemukan.
            </td></tr>
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
                    <button type="button" class="btn-pesan"
                        data-pilih-buku="${escapeHTML(buku.kode)}"
                        ${buku.stok <= 0 ? "disabled" : ""}>
                        Pilih
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tabel.querySelectorAll("[data-pilih-buku]").forEach(
        function (tombol) {
            tombol.addEventListener("click", function () {
                bukaHalaman("pemesanan");

                const pilihan = document.getElementById("pilihBuku");

                if (pilihan) {
                    pilihan.value = tombol.dataset.pilihBuku;
                }
            });
        }
    );
}

// ===================================================
// 10. PILIHAN BAHAN AJAR
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
// 11. PEMESANAN SIMULASI
// ===================================================

function pasangFormPemesanan() {
    const form = document.getElementById("formPemesanan");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nama = document.getElementById("namaPemesan")
            .value.trim();

        const email = document.getElementById("emailPemesan")
            .value.trim();

        const kode = document.getElementById("pilihBuku").value;
        const jumlah = Number(
            document.getElementById("jumlahBuku").value
        );

        const catatan = document.getElementById("catatan")
            .value.trim();

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
            tampilkanNotifikasi(
                "Bahan ajar tidak ditemukan.",
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

        const nomorPesanan =
            "ST" + Date.now().toString().slice(-10);

        daftarPesanan.push({
            nomorPesanan: nomorPesanan,
            nama: nama,
            email: email,
            kode: buku.kode,
            judul: buku.judul,
            jumlah: jumlah,
            catatan: catatan,
            status: "Menunggu"
        });

        const hasil = document.getElementById("hasilPemesanan");

        if (hasil) {
            hasil.innerHTML = `
                <div class="result-card">
                    <h3>Pesanan Berhasil Dicatat</h3>
                    <p>Nomor pesanan:
                        <strong>${escapeHTML(nomorPesanan)}</strong>
                    </p>
                    <p>Nama: ${escapeHTML(nama)}</p>
                    <p>Email: ${escapeHTML(email)}</p>
                    <p>Bahan ajar: ${escapeHTML(buku.judul)}</p>
                    <p>Jumlah: ${jumlah}</p>
                    <p>Status: Menunggu</p>
                    <p>Catatan: ${escapeHTML(catatan || "-")}</p>
                    <p>Ini adalah simulasi front-end. Data tidak disimpan
                    secara permanen.</p>
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
// 12. TRACKING DARI DATA DOSEN
// ===================================================

function pasangFormTracking() {
    const form = document.getElementById("formTracking");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = document.getElementById("nomorDO");
        const hasil = document.getElementById("hasilTracking");
        const nomor = input ? input.value.trim() : "";

        const data =
            typeof dataTracking !== "undefined"
                ? dataTracking[nomor]
                : null;

        if (!data) {
            if (hasil) {
                hasil.innerHTML = `
                    <div class="result-card">
                        <h3>Data Tidak Ditemukan</h3>
                        <p>Nomor DO tidak ditemukan dalam data praktikum.</p>
                        <p>Coba 2023001234 atau 2023005678.</p>
                    </div>
                `;
            }
            return;
        }

        const perjalanan = (data.perjalanan || []).map(function (item) {
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
                    <p>Nomor DO: ${escapeHTML(data.nomorDO)}</p>
                    <p>Nama Mahasiswa: ${escapeHTML(data.nama)}</p>
                    <p>Status: ${escapeHTML(data.status)}</p>
                    <p>Ekspedisi: ${escapeHTML(data.ekspedisi)}</p>
                    <p>Tanggal Kirim: ${escapeHTML(data.tanggalKirim)}</p>
                    <p>Kode Paket: ${escapeHTML(data.paket)}</p>
                    <p>Total Pembayaran: ${escapeHTML(data.total)}</p>
                    <h4>Riwayat Perjalanan</h4>
                    <ol>${perjalanan}</ol>
                </div>
            `;
        }
    });
}

// ===================================================
// 13. PENGAMAN TEKS HTML
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
