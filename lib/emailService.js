require("dotenv").config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_ID,
  process.env.OAUTH_CLIENT_SECRET
);

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

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

  return `
    <div style="text-align: left; font-family: Arial, sans-serif; line-height: 1.6;">
      <p>Semangat Pagi,</p>
      <p>Bapak/Ibu ${salamNama},</p>
      <p>Email ini merupakan surat tugas untuk melakukan ${taskType} terhadap proyek berikut:</p>
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
};

function createMail(to, subject, body) {
  const emailContent = [
    `From: ${process.env.GMAIL_USER}`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  // Encode email ke format Base64URL yang aman untuk API
  return Buffer.from(emailContent)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

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

    // Buat email dalam format mentah (raw)
    const rawMessage = createMail(recipients.join(","), subject, htmlBody);

    // Inisialisasi klien Gmail API
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    // Kirim email
    const result = await gmail.users.messages.send({
      userId: "me",
      resource: {
        raw: rawMessage,
      },
    });

    return {
      success: true,
      messageId: result.data.id,
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
