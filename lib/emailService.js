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

// --- Helper Functions ---

function formatIndoDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    let dateObj;
    if (typeof dateInput === 'string') {
      // Handle format YYYY-MM-DD
      const cleanDateString = dateInput.split(' ')[0].split('T')[0];
      const parts = cleanDateString.split('-');
      if (parts.length === 3) {
        dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        dateObj = new Date(dateInput);
      }
    } else {
      dateObj = new Date(dateInput);
    }

    if (isNaN(dateObj.getTime())) return dateInput.toString();

    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
    });
  } catch (e) {
    return dateInput;
  }
}

/**
 * Membuat Raw Email string yang kompatibel dengan Gmail API (Base64Url encoded)
 */
function createEmailBody(to, subject, htmlContent) {
  // Encode subject untuk support karakter khusus/UTF-8
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;

  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=UTF-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    htmlContent
  ];
  const message = messageParts.join('\n');

  // Convert to Base64WebSafe string
  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// --- Main Email Function ---

async function sendEmail(formType, data) {
  try {
    let to = '';
    let subject = '';
    let html = '';

    // === LOGIKA 1: INPUT PIC ===
    if (formType === 'input_pic') {
      to = data.email_tujuan;
      subject = `[INFO] Input Data PIC - ${data.cabang}`;
      html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0054A6;">Notifikasi Input Data PIC</h2>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Nama</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.nama}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jabatan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.jabatan}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Cabang</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.cabang}</td></tr>
                </table>
            </div>`;

      // === LOGIKA 2: APPROVAL PERPANJANGAN SPK (Hanya Ke Manager) ===
    } else if (formType === 'perpanjangan_spk_approval') {
      to = data.manager_email;
      subject = `[PERLU PERSETUJUAN] Perpanjangan SPK - ${data.nomor_ulok}`;
      const btnStyle = "display: inline-block; padding: 10px 20px; margin: 10px 5px; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;";

      html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0;">
                <h2 style="color: #d32f2f;">Permintaan Perpanjangan SPK</h2>
                <p>Yth. Bapak/Ibu <strong>${data.manager_nama}</strong>,</p>
                <p>Mohon persetujuan untuk pengajuan berikut:</p>
                <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>No. Ulok</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.nomor_ulok}</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Pertambahan</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.pertambahan_hari} Hari</td></tr>
                    <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Alasan</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${data.alasan_spk}</td></tr>
                </table>
                <div style="text-align: center;">
                    <a href="${data.pdfUrl}" style="${btnStyle} background-color: #0054A6;">📄 Lihat PDF</a>
                    <a href="${data.approveUrl}" style="${btnStyle} background-color: #2e7d32;">✅ SETUJUI</a>
                    <a href="${data.rejectUrl}" style="${btnStyle} background-color: #c62828;">❌ TOLAK</a>
                </div>
            </div>`;

      // === LOGIKA 3: NOTIFIKASI HASIL (Ke Semua Pihak: Manager, Kontraktor, Regional) ===
    } else if (formType === 'perpanjangan_spk_notification') {

      // [UPDATE KHUSUS] Handle Array Recipients dari Apps Script
      // Apps Script mengirim array seperti: ["email1@x.com", "email2@x.com", "email_regional@x.com"]
      // Kita gabung jadi string: "email1@x.com, email2@x.com, email_regional@x.com"
      if (Array.isArray(data.recipients)) {
        to = data.recipients.join(', ');
      } else {
        to = data.recipients;
      }

      const isApproved = data.status_persetujuan === 'DISETUJUI';
      const color = isApproved ? '#2e7d32' : '#c62828';
      const statusText = isApproved ? 'DISETUJUI' : 'DITOLAK';
      subject = `[${statusText}] Status Pengajuan SPK - ${data.nomor_ulok}`;

      html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0;">
                <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">
                    ${isApproved ? '✅ Pengajuan Disetujui' : '❌ Pengajuan Ditolak'}
                </h2>
                <p>Status terbaru untuk pengajuan SPK <strong>${data.nomor_ulok}</strong>:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: ${color}; font-weight: bold;">${statusText}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Diproses Oleh</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.disetujui_oleh || '-'}</td></tr>
                    ${!isApproved ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: red;"><strong>Alasan Ditolak</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: red;">${data.alasan_penolakan}</td></tr>` : ''}
                </table>
                
                ${isApproved ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${data.link_pdf}" style="display: inline-block; padding: 12px 24px; background-color: #0054A6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">📄 Unduh Dokumen Resmi</a>
                </div>` : ''}
                
                <p style="font-size: 11px; color: #888; margin-top: 30px;">
                    Email ini dikirim ke: ${to}
                </p>
            </div>`;
    }

    // Generate Raw Email
    const rawMessage = createEmailBody(to, subject, html);

    // Kirim via Gmail API
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: rawMessage,
      },
    });

    console.log(`✅ Email terkirim ke: ${to} (ID: ${response.data.id})`);
    return { success: true, id: response.data.id };

  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };