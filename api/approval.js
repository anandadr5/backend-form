// File: api/approval.js
const axios = require("axios");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const cors = require("cors")({
  origin: "*", // Allow all origins for approval links
  methods: ["GET", "POST", "OPTIONS"],
});

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(200).end();

    // Ambil parameter dari URL (Link di Email)
    const { action, row, approver, ulok, gas_url } = req.query;

    if (!gas_url || !row) {
      return res.status(400).send("Parameter tidak lengkap (gas_url atau row hilang).");
    }

    try {
      // LOGIKA APPROVE: Download -> Stamp -> Upload -> Update Sheet
      if (action === "approve") {
        
        // 1. Minta konten PDF Base64 SAAT INI dari GAS
        // (Pastikan function getPdfContent sudah ada di GAS seperti panduan sebelumnya)
        console.log("Mengambil PDF dari GAS...");
        const getPdfResponse = await axios.get(`${gas_url}?action=getPdfContent&row=${row}`);
        
        if (getPdfResponse.data.status !== "success" || !getPdfResponse.data.pdfBase64) {
          throw new Error("Gagal mengambil PDF dari GAS atau PDF belum ada.");
        }

        const pdfBase64 = getPdfResponse.data.pdfBase64;
        const pdfId = getPdfResponse.data.pdfId;

        // 2. Load PDF menggunakan pdf-lib
        console.log("Memproses Stamping PDF...");
        const pdfDoc = await PDFDocument.load(pdfBase64);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0]; // Halaman 1 (Laporan Sistem)
        
        // Load Font
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helveticaRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 3. GAMBAR TANDA TANGAN / STAMP
        // Sesuaikan koordinat X dan Y agar pas di kolom tanda tangan Manager
        // Koordinat (0,0) ada di kiri bawah.
        const stampX = 360; // Geser Kanan/Kiri
        const stampY = 135; // Geser Atas/Bawah

        firstPage.drawText(`DISETUJUI`, {
          x: stampX,
          y: stampY + 15,
          size: 11,
          font: helveticaFont,
          color: rgb(0, 0.6, 0), // Warna Hijau
        });

        firstPage.drawText(`${approver}`, {
          x: stampX,
          y: stampY,
          size: 11,
          font: helveticaFont,
          color: rgb(0, 0, 0), // Hitam
        });

        firstPage.drawText(`Tgl: ${new Date().toLocaleDateString('id-ID')}`, {
          x: stampX,
          y: stampY - 12,
          size: 9,
          font: helveticaRegular,
          color: rgb(0.4, 0.4, 0.4), // Abu-abu
        });

        // 4. Simpan hasil edit jadi Base64
        const signedPdfBase64 = await pdfDoc.saveAsBase64();

        // 5. Upload balik ke GAS (Timpa file lama)
        // (Pastikan function updatePdfContent sudah ada di GAS)
        console.log("Mengupdate PDF ke GAS...");
        await axios.post(gas_url, {
          action: "updatePdfContent",
          row: row,
          pdfId: pdfId,
          ulok: ulok,
          pdfBase64: signedPdfBase64
        });

        // 6. Update Status di Spreadsheet jadi "DISETUJUI"
        console.log("Mengupdate Status Sheet...");
        await axios.get(`${gas_url}?action=processApproval&row=${row}&approver=${encodeURIComponent(approver)}`);

        // Tampilkan halaman sukses sederhana
        return res.status(200).send(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: green;">✓ Berhasil Disetujui</h1>
            <p>Dokumen SPK ${ulok} telah ditandatangani secara digital oleh <b>${approver}</b>.</p>
            <p>Anda dapat menutup jendela ini.</p>
          </div>
        `);
      } 
      
      // LOGIKA REJECT (Tidak perlu edit PDF, cuma update status)
      else if (action === "reject") {
        await axios.get(`${gas_url}?action=processRejection&row=${row}&approver=${encodeURIComponent(approver)}&reason=Ditolak_via_Email`);
        
        return res.status(200).send(`
          <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: red;">✕ Berhasil Ditolak</h1>
            <p>Permintaan SPK ${ulok} telah ditolak.</p>
          </div>
        `);
      }

      return res.status(400).send("Action tidak dikenali.");

    } catch (error) {
      console.error("Approval Error:", error);
      return res.status(500).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1 style="color: red;">Error!</h1>
          <p>Gagal memproses permintaan.</p>
          <pre>${error.message}</pre>
        </div>
      `);
    }
  });
};