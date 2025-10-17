require("dotenv").config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

// URL form selanjutnya untuk setiap form type dan kategori
const formLinks = {
  "input-pic": {
    non_ruko_non_urugan_30hr:
      "https://frontend-form-virid.vercel.app/h2_30hr.html",
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/h2_35hr.html",
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/h2_40hr.html",
    non_ruko_urugan_48hr: "https://frontend-form-virid.vercel.app/h2_48hr.html",
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
    non_ruko_urugan_48hr:
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
    non_ruko_urugan_48hr:
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
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h32_48hr.html",
  },
  h28: {
    non_ruko_non_urugan_35hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h32: {
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/h41_48hr.html",
  },
  h33: {
    non_ruko_non_urugan_40hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
  h41: {
    non_ruko_urugan_48hr:
      "https://frontend-form-virid.vercel.app/serah_terima.html",
  },
};

function getFormUrl(formType, kategori, email, nama, cabang) {
  const baseUrl = formLinks[formType]?.[kategori] || "#";
  if (baseUrl === "#") return baseUrl;

  return `${baseUrl}?email=${encodeURIComponent(
    email
  )}&nama=${encodeURIComponent(nama)}&cabang=${encodeURIComponent(cabang)}`;
}

// Fungsi untuk membuat email dalam format RFC 2822
function createEmailMessage(to, subject, htmlBody) {
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const messageParts = [
    `From: ${process.env.EMAIL_USER}`,
    `To: ${to.join(", ")}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(htmlBody)
      .toString("base64")
      .replace(/(.{76})/g, "$1\r\n"),
  ];

  return messageParts.join("\r\n");
}

// Fungsi pembantu untuk menghasilkan body email umum
function generateCommonEmailBody(
  data,
  formType,
  taskType,
  linkText,
  isSerahTerima = false,
  additionalInfo = {}
) {
  const formUrl = getFormUrl(
    formType,
    data.kategori_lokasi,
    data.pic_building_support,
    data.pic_nama,
    data.cabang
  );

  let salamNama;
  if (formType === "input-pic") {
    const isRuko = data.kategori_lokasi.startsWith("ruko");
    salamNama = `<strong>${data.pic_nama}</strong>`;
    if (isRuko) {
      if (data.manager_nama && data.koordinator_nama) {
        salamNama = `<strong>${data.manager_nama}</strong> dan <strong>${data.pic_nama}</strong> atau <strong>${data.koordinator_nama}</strong>`;
      } else if (data.manager_nama) {
        salamNama = `<strong>${data.manager_nama}</strong> dan <strong>${data.pic_nama}</strong>`;
      } else if (data.koordinator_nama) {
        salamNama = `<strong>${data.pic_nama}</strong> dan <strong>${data.koordinator_nama}</strong>`;
      }
    }
  } else if (formType === "h2") {
    const isNonRuko = data.kategori_lokasi.startsWith("non_ruko");
    if (isNonRuko) {
      const namaParts = [data.pic_nama];
      if (data.koordinator_nama) namaParts.push(data.koordinator_nama);
      if (data.manager_nama) namaParts.push(data.manager_nama);
      salamNama = `<strong>${namaParts.join(", ")}</strong>`;
    } else {
      salamNama = `<strong>${data.pic_nama}</strong>`;
    }
  } else if (formType === "h7") {
    const isNonRuko = data.kategori_lokasi.startsWith("non_ruko");
    if (isNonRuko) {
      salamNama = `<strong>${data.pic_nama}</strong>`;
    } else {
      salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
    }
  } else if (formType === "serah-terima") {
    const salamNamaParts = [];
    if (data.manager_nama)
      salamNamaParts.push(`<strong>${data.manager_nama}</strong>`);
    if (data.koordinator_nama)
      salamNamaParts.push(`<strong>${data.koordinator_nama}</strong>`);
    if (data.pic_nama) salamNamaParts.push(`<strong>${data.pic_nama}</strong>`);
    salamNama =
      salamNamaParts.length > 0
        ? `${salamNamaParts.join(", ")}`
        : "Tim Building Support";
  } else if (formType === "h10") {
    if (
      data.kategori_lokasi === "ruko_14hr" ||
      data.kategori_lokasi === "non_ruko_urugan_48hr"
    ) {
      salamNama = `<strong>${data.pic_nama}</strong>`;
    } else {
      salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
    }
  } else if (["h5", "h12", "h18", "h22", "h25", "h32"].includes(formType)) {
    if (formType === "h25" && data.kategori_lokasi === "non_ruko_urugan_48hr") {
      salamNama = `<strong>${data.pic_nama}</strong>`;
    } else {
      salamNama = `<strong>${data.koordinator_nama}</strong> dan <strong>${data.manager_nama}</strong>`;
    }
  } else {
    salamNama = `<strong>${data.pic_nama}</strong>`;
  }

  const taskDateLabel = isSerahTerima ? "Tanggal Tugas" : "Tanggal Pengawasan";

  let additionalHtml = "";
  if (additionalInfo.statusSerah) {
    additionalHtml += `<li><strong>Status Serah Terima:</strong> ${additionalInfo.statusSerah}</li>`;
  }
  if (additionalInfo.tglSerahBerikut) {
    additionalHtml += `<li><strong>Tanggal Serah Terima Berikutnya:</strong> ${additionalInfo.tglSerahBerikut}</li>`;
  }

  const opnameLinkHtml =
    formType === "serah-terima"
      ? `<p>Silakan lakukan opname melalui link berikut: <a href="https://opnamebnm.vercel.app/" target="_blank">https://opnamebnm.vercel.app/</a></p>`
      : "";

  return `
    <div style="text-align: left; font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Semangat Pagi,</p>
      <p>Bapak/Ibu ${salamNama},</p>
      <p>Email ini merupakan surat tugas untuk ${taskType} terhadap proyek berikut:</p>
      <ul>
        <li><strong>${taskDateLabel}:</strong> ${data.tanggal_mengawas}</li>
        ${additionalHtml}
        <li><strong>Kode Ulok:</strong> ${data.kode_ulok}</li>
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
      ${
        data.pdfUrl
          ? `<p>📄 <a href="${data.pdfUrl}" target="_blank">Lihat Laporan PDF</a></p>`
          : ""
      }
      ${
        formUrl !== "#"
          ? `<p>Mohon untuk segera mengisi laporan ${
              isSerahTerima ? "Serah Terima" : "pengawasan"
            } Anda melalui link di bawah ini:</p>
             <p>📌 <a href="${formUrl}" target="_blank">${linkText}</a></p>`
          : ""
      }
      <p>Selamat bertugas dan ingat, ketepatan pelaksanaan serta keakuratan data yang dilaporkan merupakan gambaran kinerja Anda.</p>
       ${opnameLinkHtml}
      <p>Terima kasih atas kerjasamanya.</p>
      <p><em>Email ini dikirim secara otomatis. Mohon untuk tidak membalas email ini.</em></p>
    </div>
  `;
}

// Template email untuk setiap jenis form
const emailTemplates = {
  "input-pic": {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [data.pic_building_support];
      if (data.kategori_lokasi.startsWith("ruko")) {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "input-pic",
        "Pengawasan",
        "Isi Laporan Selanjutnya"
      ),
  },

  h2: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      const isNonRuko = data.kategori_lokasi.startsWith("non_ruko");
      if (isNonRuko) {
        recipients.push(data.pic_building_support);
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      } else {
        recipients.push(data.pic_building_support);
      }
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h2",
        "Pengawasan H2",
        "Isi Laporan Selanjutnya"
      ),
  },

  h5: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h5",
        "Pengawasan H5",
        "Isi Laporan Selanjutnya"
      ),
  },

  h7: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      const isRuko = data.kategori_lokasi.startsWith("ruko");
      const isNonRuko = data.kategori_lokasi.startsWith("non_ruko");
      if (isRuko) {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      } else if (isNonRuko) {
        recipients.push(data.pic_building_support);
      }
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h7",
        "Pengawasan H7",
        "Isi Laporan Selanjutnya"
      ),
  },

  h8: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h8",
        "Pengawasan H8",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h10: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      return [data.pic_building_support].filter(Boolean);
    },
    getHtmlBody: (data) => {
      const isSerahTerima = data.kategori_lokasi === "ruko_14hr";
      const taskType = "Pengawasan H10";
      const linkText = isSerahTerima
        ? "Isi Laporan Serah Terima"
        : "Isi Laporan Selanjutnya";
      return generateCommonEmailBody(
        data,
        "h10",
        taskType,
        linkText,
        isSerahTerima
      );
    },
  },

  h12: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h12",
        "Pengawasan H12",
        "Isi Laporan Selanjutnya"
      ),
  },

  h14: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h14",
        "Pengawasan H14",
        "Isi Laporan Selanjutnya"
      ),
  },

  h16: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h16",
        "Pengawasan H16",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h17: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h17",
        "Pengawasan H17",
        "Isi Laporan Selanjutnya"
      ),
  },

  h18: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h18",
        "Pengawasan H18",
        "Isi Laporan Selanjutnya"
      ),
  },

  h22: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h22",
        "Pengawasan H22",
        "Isi Laporan Selanjutnya"
      ),
  },

  h23: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h23",
        "Pengawasan H23",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h25: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.kategori_lokasi === "non_ruko_urugan_48hr") {
        recipients.push(data.pic_building_support);
      } else if (data.kategori_lokasi === "non_ruko_non_urugan_40hr") {
        if (data.koordinator_email) recipients.push(data.koordinator_email);
        if (data.manager_email) recipients.push(data.manager_email);
      }
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h25",
        "Pengawasan H25",
        "Isi Laporan Selanjutnya"
      ),
  },

  h28: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h28",
        "Pengawasan H28",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h32: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h32",
        "Pengawasan H32",
        "Isi Laporan Selanjutnya"
      ),
  },

  h33: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h33",
        "Pengawasan H33",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  h41: {
    getSubject: (data) =>
      `Informasi Jadwal Pengawasan untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => [data.pic_building_support].filter(Boolean),
    getHtmlBody: (data) =>
      generateCommonEmailBody(
        data,
        "h41",
        "Pengawasan H41",
        "Isi Laporan Serah Terima",
        true
      ),
  },

  "serah-terima": {
    getSubject: (data) =>
      `Informasi Serah Terima untuk Toko: ${data.kode_ulok}`,
    getRecipients: (data) => {
      const recipients = [];
      if (data.pic_building_support) recipients.push(data.pic_building_support);
      if (data.koordinator_email) recipients.push(data.koordinator_email);
      if (data.manager_email) recipients.push(data.manager_email);
      return recipients.filter(Boolean);
    },
    getHtmlBody: (data) =>
      generateCommonEmailBody(data, "serah-terima", "Serah Terima", "", true, {
        statusSerah: data.status_serah || "-",
        tglSerahBerikut: data.tanggal_serah || "-",
      }),
  },

  "perpanjangan_spk_approval": {
      getSubject: (data) => `[PERLU PERSETUJUAN] Perpanjangan SPK untuk Toko: ${data.nomor_ulok}`,
      getRecipients: (data) => [data.manager_email],
      getHtmlBody: (data) => `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Yth. Bapak/Ibu <strong>${data.manager_nama}</strong>,</p>
          <p>Melalui email ini, kami mengajukan permohonan persetujuan untuk perpanjangan Surat Perintah Kerja (SPK) dengan rincian sebagai berikut:</p>
          <ul>
            <li><strong>Nomor Ulok:</strong> ${data.nomor_ulok}</li>
            <li><strong>Pertambahan Hari:</strong> ${data.pertambahan_hari} hari</li>
            <li><strong>Diajukan Oleh:</strong> ${data.dibuat_oleh_nama}</li>
            <li><strong>Alasan:</strong><br/>${data.alasan_spk.replace(/\n/g, '<br/>')}</li>
            <li><strong>Dokumen Terlampir:</strong> <a href="${data.pdfUrl}" target="_blank">Lihat PDF</a></li>
          </ul>
          <p>Mohon untuk dapat memberikan tinjauan dan keputusan Anda dengan memilih salah satu opsi di bawah ini:</p>
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <a href="${data.approveUrl}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">SETUJU</a>
              </td>
              <td style="padding-left: 10px;">
                <a href="${data.rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; text-align: center;">TOLAK</a>
              </td>
            </tr>
          </table>
          <br/>
          <p>Terima kasih.</p>
        </div>
      `
    },

    "perpanjangan_spk_notification": {
      getSubject: (data) => `[${data.status.toUpperCase()}] Respon Perpanjangan SPK untuk Toko: ${data.nomor_ulok}`,
      getRecipients: (data) => data.recipients,
      getHtmlBody: (data) => `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Pemberitahuan,</p>
          <p>Permintaan perpanjangan SPK untuk <strong>Nomor Ulok ${data.nomor_ulok}</strong> telah direspon.</p>
          <ul>
            <li><strong>Status:</strong> <strong style="color:${data.status === 'disetujui' ? 'green' : 'red'};">${data.status.toUpperCase()}</strong></li>
            <li><strong>Ditinjau Oleh:</strong> ${data.disetujui_oleh}</li>
            <li><strong>Waktu Respon:</strong> ${new Date(data.waktu_persetujuan).toLocaleString('id-ID')}</li>
            ${data.status === 'ditolak' ? `<li><strong>Alasan Penolakan:</strong> ${data.alasan_penolakan}</li>` : ''}
            <li><strong>Dokumen Terlampir:</strong> <a href="${data.link_pdf}" target="_blank">Lihat PDF</a></li>
          </ul>
          <p>Terima kasih.</p>
        </div>
      `
    }
};

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

    const rawMessage = createEmailMessage(recipients, subject, htmlBody);

    // Encode ke base64url
    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Kirim email menggunakan Gmail API
    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: result.data.id,
      recipients: recipients,
      message: "Email berhasil dikirim menggunakan Gmail API",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error("Gmail API Error Response:", error.response.data);
      return {
        success: false,
        error: error.response.data.error?.message || error.message,
        message: "Gagal mengirim email - Gmail API Error",
      };
    }

    return {
      success: false,
      error: error.message,
      message: "Gagal mengirim email",
    };
  }
}

// Fungsi untuk memverifikasi konfigurasi
async function verifyConnection() {
  try {
    console.log("🔄 Memverifikasi koneksi Gmail API...");

    // Test dengan mendapatkan profile user
    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    console.log(`✅ Gmail API connection verified successfully`);
    console.log(`📧 Email: ${profile.data.emailAddress}`);
    console.log(`📊 Total messages: ${profile.data.messagesTotal}`);

    return true;
  } catch (error) {
    console.error("❌ Gmail API connection failed:", error);
    if (error.response) {
      console.error("Error details:", error.response.data);
    }
    return false;
  }
}

// Fungsi untuk mengirim email dengan retry mechanism
async function sendEmailWithRetry(formType, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Percobaan ${attempt} dari ${maxRetries}`);
      const result = await sendEmail(formType, data);

      if (result.success) {
        return result;
      }

      // Jika tidak berhasil tapi bukan karena network error, jangan retry
      if (
        result.error.includes("invalid") ||
        result.error.includes("permission")
      ) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ Percobaan ${attempt} gagal:`, error.message);

      if (attempt === maxRetries) {
        throw error;
      }

      // Wait sebelum retry dengan exponential backoff
      const waitTime = attempt * 2000;
      console.log(`⏳ Menunggu ${waitTime}ms sebelum retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

module.exports = {
  sendEmail,
  sendEmailWithRetry,
  verifyConnection,
};
