require("dotenv").config();
const nodemailer = require("nodemailer");

// Konfigurasi SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

// Mapping hari kerja untuk setiap kategori
const jumlahHariKerjaMap = {
  non_ruko_non_urugan_30hr: {
    h7: 14,
    h14: 18,
    h17: 22,
    h18: 23,
    h22: 28,
    h23: 30,
    h28: 35,
  },
  non_ruko_non_urugan_35hr: {
    h7: 17,
    h17: 22,
    h22: 28,
    h28: 35,
  },
  non_ruko_non_urugan_40hr: {
    h7: 17,
    h17: 25,
    h25: 33,
    h33: 40,
  },
  non_ruko_non_urugan_48hr: {
    h10: 25,
    h25: 32,
    h32: 41,
    h41: 48,
  },
  ruko_10hr: {
    h5: 8,
    h8: 10,
  },
  ruko_14hr: {
    h7: 10,
    h10: 14,
  },
  ruko_20hr: {
    h12: 16,
    h16: 20,
  },
};

// URL form selanjutnya untuk setiap form type dan kategori
const formLinks = {
  "input-pic": {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h2_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h2_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h2_40hr.html",
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h2_48hr.html",
    ruko_10hr: "https://frontend-form-virid.vercel.app/h2_10hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h2_14hr.html",
    ruko_20hr: "https://frontend-form-virid.vercel.app/h2_20hr.html",
  },
  h2: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h7_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h7_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h7_40hr.html",
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h10_48hr.html",
    ruko_10hr: "https://frontend-form-virid.vercel.app/h5_10hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h7_14hr.html",
    ruko_20hr: "https://frontend-form-virid.vercel.app/h12_20hr.html",
  },
  h5: {
    ruko_10hr: "https://frontend-form-virid.vercel.app/h8_10hr.html",
  },
  h7: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h14_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h17_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h17_40hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/h10_14hr.html",
  },
  h8: {
    ruko_10hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h10: {
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h25_48hr.html",
    ruko_14hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h12: {
    ruko_20hr: "https://frontend-form-virid.vercel.app/h16_20hr.html",
  },
  h14: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h18_30hr.html",
  },
  h16: {
    ruko_20hr: "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h17: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h22_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h25_40hr.html",
  },
  h18: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h23_30hr.html",
  },
  h22: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h28_35hr.html",
  },
  h23: {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h25: {
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h33_40hr.html",
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h32_48hr.html",
  },
  h28: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h32: {
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h41_48hr.html",
  },
  h33: {
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h41: {
    non_ruko_non_urugan_48hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
};

// Helper function untuk mendapatkan URL form selanjutnya
function getFormUrl(formType, kategori, email, nama, cabang) {
  const baseUrl = formLinks[formType]?.[kategori] || "#";
  if (baseUrl === "#") return baseUrl;

  return `${baseUrl}?email=${encodeURIComponent(
    email
  )}&nama=${encodeURIComponent(nama)}&cabang=${encodeURIComponent(cabang)}`;
}

// Template email untuk setiap jenis form
const emailTemplates = {
  "input-pic": {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];

      // Untuk kategori ruko, tambahkan koordinator dan manager
      if (data.kategori_lokasi.startsWith("ruko")) {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }

      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isRuko = data.kategori_lokasi.startsWith("ruko");
      let salamNama = `<strong>${data.pic_nama}</strong>`;

      if (isRuko) {
        if (data.manager_nama && data.koordinator_nama) {
          salamNama = `<strong>${data.manager_nama}</strong> dan <strong>${data.pic_nama}</strong> atau <strong>${data.koordinator_nama}</strong>`;
        } else if (data.manager_nama) {
          salamNama = `<strong>${data.manager_nama}</strong> dan <strong>${data.pic_nama}</strong>`;
        } else if (data.koordinator_nama) {
          salamNama = `<strong>${data.pic_nama}</strong> dan <strong>${data.koordinator_nama}</strong>`;
        }
      }

      const formUrl = getFormUrl(
        "input-pic",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="text-align: left; font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Mengawas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>🔗 <a href="${formUrl}" target="_blank">${formUrl}</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h2: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      const isNonRuko = data.kategori_lokasi.startsWith("non_ruko_non_urugan");

      if (isNonRuko) {
        recipients.push(data.pic_building_support);
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }

      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isNonRuko = data.kategori_lokasi.startsWith("non_ruko_non_urugan");
      let salamNama = `<strong>${data.pic_nama}</strong>`;

      if (isNonRuko && data.manager_nama && data.koordinator_nama) {
        salamNama = `<strong>${data.manager_nama}</strong>, <strong>${data.koordinator_nama}</strong>, dan <strong>${data.pic_nama}</strong>`;
      }

      const formUrl = getFormUrl(
        "h2",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H2 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h5: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
      const formUrl = getFormUrl(
        "h5",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H5 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h7: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      const isNonRuko = data.kategori_lokasi.startsWith("non_ruko_non_urugan");
      const isRuko = data.kategori_lokasi.startsWith("ruko");

      if (isRuko) {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      } else if (isNonRuko) {
        recipients.push(data.pic_building_support);
      }

      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isRuko = data.kategori_lokasi.startsWith("ruko");
      const salamNama = isRuko
        ? `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`
        : `<strong>${data.pic_nama}</strong>`;

      const formUrl = getFormUrl(
        "h7",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H7 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h8: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h8",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h10: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];

      if (data.kategori_lokasi === "ruko_14hr") {
        recipients.push(data.pic_building_support);
      } else {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }

      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isSerahTerima = data.kategori_lokasi === "ruko_14hr";
      const salamNama = isSerahTerima
        ? `<strong>${data.pic_nama}</strong>`
        : `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;

      const formUrl = getFormUrl(
        "h10",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );
      const taskType = isSerahTerima ? "Serah Terima" : "Pengawasan H10";
      const linkText = isSerahTerima
        ? "Isi Laporan Serah Terima"
        : "Isi Laporan Selanjutnya";

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan ${taskType} terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal ${
              isSerahTerima ? "Tugas" : "Pengawasan"
            }:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${
              data.spkUrl
            }" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${
              data.rabUrl
            }" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${
            data.pdfUrl
          }" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan ${
            isSerahTerima ? "Serah Terima" : "pengawasan"
          } Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">${linkText}</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h12: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
      const formUrl = getFormUrl(
        "h12",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H12 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h14: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h14",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H14 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h16: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h16",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h17: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h17",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H17 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h18: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
      const formUrl = getFormUrl(
        "h18",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H18 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h22: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
      const formUrl = getFormUrl(
        "h22",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H22 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h23: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h23",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h25: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];

      if (data.kategori_lokasi === "non_ruko_non_urugan_48hr") {
        recipients.push(data.pic_building_support);
      } else if (data.kategori_lokasi === "non_ruko_non_urugan_40hr") {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }

      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama =
        data.kategori_lokasi === "non_ruko_non_urugan_40hr"
          ? `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`
          : `<strong>${data.pic_nama}</strong>`;

      const formUrl = getFormUrl(
        "h25",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H25 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h28: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h28",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h32: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
      const formUrl = getFormUrl(
        "h32",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Pengawasan H32 terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Pengawasan:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan pengawasan Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Selanjutnya</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h33: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h33",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  h41: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) => {
      const salamNama = `<strong>${data.pic_nama}</strong>`;
      const formUrl = getFormUrl(
        "h41",
        data.kategori_lokasi,
        data.pic_building_support,
        data.pic_nama,
        data.cabang
      );

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>Bapak/Ibu ${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Mohon untuk segera mengisi laporan Serah Terima Anda melalui link di bawah ini:</p>
          <p>📌 <a href="${formUrl}" target="_blank">Isi Laporan Serah Terima</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p>Terima kasih atas kerjasamanya.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },

  "serah-terima": {
    getSubject: (data) =>
      `Informasi Serah Terima untuk Toko: ${data.kode_toko}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.pic_building_support) recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) => {
      const salamNamaParts = [];
      if (data.manager_nama)
        salamNamaParts.push(`<strong>${data.manager_nama}</strong>`);
      if (data.koordinator_nama)
        salamNamaParts.push(`<strong>${data.koordinator_nama}</strong>`);
      if (data.pic_nama)
        salamNamaParts.push(`<strong>${data.pic_nama}</strong>`);
      const salamNama =
        salamNamaParts.length > 0
          ? `Bapak/Ibu ${salamNamaParts.join(", ")}`
          : "Tim Building Support";

      const statusSerah = data.status_serah || "-";
      const tglSerahBerikut = data.tanggal_serah || "-";

      return `
        <div style="font-family: Arial;">
          <p>Semangat Pagi,</p>
          <p>${salamNama},</p>
          <p>Email ini merupakan surat tugas untuk melakukan Serah Terima terhadap proyek berikut:</p>
          <ul>
            <li><strong>Tanggal Tugas:</strong> ${data.tanggal_mengawas}</li>
            <li><strong>Status Serah Terima:</strong> ${statusSerah}</li>
            <li><strong>Tanggal Serah Terima Berikutnya:</strong> ${tglSerahBerikut}</li>
            <li><strong>Kode Toko:</strong> ${data.kode_toko}</li>
            <li><strong>Cabang:</strong> ${data.cabang}</li>
            <li><strong>Kategori Lokasi:</strong> ${data.kategori_lokasi}</li>
            <li><strong>Tanggal Mulai SPK:</strong> ${data.tanggal_spk}</li>
            <li><strong>File SPK:</strong> <a href="${data.spkUrl}" target="_blank">${data.spkUrl}</a></li>
            <li><strong>File RAB & Lampiran:</strong> <a href="${data.rabUrl}" target="_blank">${data.rabUrl}</a></li>
          </ul>
          <p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>
          <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
          <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
        </div>
      `;
    },
  },
};

// Fungsi untuk mengirim email
async function sendEmail(formType, data) {
  try {
    const template = emailTemplates[formType];
    if (!template) {
      throw new Error(`Template untuk form type '${formType}' tidak ditemukan`);
    }

    const recipients = template.getRecipients(data);
    if (recipients.length === 0) {
      throw new Error("Tidak ada penerima email yang ditemukan");
    }

    const subject = template.getSubject(data);
    const htmlBody = template.getHtmlBody(data);

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipients.join(","),
      subject: subject,
      html: htmlBody,
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      recipients: recipients,
      message: "Email berhasil dikirim",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
      message: "Gagal mengirim email",
    };
  }
}

module.exports = {
  sendEmail,
};
