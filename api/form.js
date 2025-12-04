const axios = require("axios");
const { PDFDocument } = require("pdf-lib");
const { google } = require("googleapis");

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const KEYFILEPATH = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');

const cors = require("cors")({
  origin: [
    "https://frontend-form-virid.vercel.app",
    "https://script.google.com",
  ],
  methods: ["GET", "POST", "OPTIONS"],
});

const GAS_URLS = {
  "input-pic":
    "https://script.google.com/macros/s/AKfycbzMWfroqPvtZXA1gz5VqdUzJhtyV_q8hWH92gl7JqFct5_dTVI2mcwmDHY6Rac5vmu-ww/exec",
  login:
    "https://script.google.com/macros/s/AKfycbzCWExZ5r__w0viXeC1o5FXerwsqaC8y5XZg_W8zPMozlnLILHOJ1pPT4N-JDOFN6Jy/exec",
  h2: "https://script.google.com/macros/s/AKfycbyHaiwKENoWsOEEgj2KHr3LQW-PwfkF-Fob7fgvUV52AusSAWaY8etSmeSZeiotK7Jvhw/exec",
  h5: "https://script.google.com/macros/s/AKfycbzVdc7Uz2SFopdbcaWerO5UK7t6PAc7cPJVrV2s45iwe5uFTGtLzLRP7ZLv4T7kWus/exec",
  h7: "https://script.google.com/macros/s/AKfycbxI5kdLFj4_45qqN63DZXJQ0Bv5CfSCjMcuMX7xWsaEbURUDhUhtrrfEa0eM8Jsq-sJHQ/exec",
  h8: "https://script.google.com/macros/s/AKfycbySrgPzCpyUYhHKCGXrtIWfMtSTdLXdQeonzfoI1ro_R4rIZ9EewKPS4T6vM4ZoQuftUQ/exec",
  h10: "https://script.google.com/macros/s/AKfycbzKmUVsDXzoTd39R37lVbkOhBPwuwasJQk2VVnLxD0jmy_yymdWpTPwa8YN87TLLloF8A/exec",
  h12: "https://script.google.com/macros/s/AKfycbxwEkg5bSqPqXs2j6xnGqZZ-vU_ao5SpUCs6wlSrj5UOr5KL5UqM2Fjpoev7fyVlv29/exec",
  h14: "https://script.google.com/macros/s/AKfycby50bSmRPZv7dizGTP-en9HmJ4wHzVX_aO0iwbXpU_2P6T1dlhENzk6XldL7LdbvaKL_A/exec",
  h16: "https://script.google.com/macros/s/AKfycbzSFg-L9Kfu2EjAR2R70c6RE6vm9mFDItGq5JbuFIJhQIJHVcA20fpYlC4xSncpcbYKMA/exec",
  h17: "https://script.google.com/macros/s/AKfycbwJdY8vlAbzy8_iEoqTZFyrE_ZlnHjdNy777eVUeOf8sc7aV0V_5bwwbPserG0hMCafnA/exec",
  h18: "https://script.google.com/macros/s/AKfycbwRo61WD-mjalS5StjfzpnNA2peTXMXcb6mTAjfrxPU93kmtjYJrp_uecumr3qQPnB4mQ/exec",
  h22: "https://script.google.com/macros/s/AKfycbx1TgvEvXqSehwU6h3GVsmuJ49gPs0NsWZ9NsJZUJd7W30Qa97tPBrfKJnSQHV_Fhfr/exec",
  h23: "https://script.google.com/macros/s/AKfycbz-XKWo1WEHve_a6KIVNNcgy8ZtlnSNGKTfzsa9CF_La6i88VzFi-kEgOfpT2f6PIc/exec",
  h25: "https://script.google.com/macros/s/AKfycbxZ-4vyNXPqcpUyORsJqhBxEKZgBEVMbmmXmLQNoZbmgK1Dxda-MG8l2UQhTEjXw0fhOw/exec",
  h28: "https://script.google.com/macros/s/AKfycby3VlggJaznV7GHpp86p_eu8lvEm82uAoh5IVTURdHCprBWFFFh5cg7QnBSMtEVdESf/exec",
  h32: "https://script.google.com/macros/s/AKfycbxqGR62PV_X86mFFJpMclgNYtGvkx8gVboONt62ynnFdOr25xKINkelEBdqnrqP7SHN/exec",
  h33: "https://script.google.com/macros/s/AKfycbzuYFFG018O54U4nsp6iEtJ4kg57no3Juan22FICwf_VZkpNLjKMW7ZLu3Z_6WoWYsTOA/exec",
  h41: "https://script.google.com/macros/s/AKfycbwgIbxOWzUeVwMnzqUsrggqTivg-_mtUXEnNYVKs8aIRlmcJo4JZz5dPlXDYfn4Fbib/exec",
  serah_terima:
    "https://script.google.com/macros/s/AKfycbzYIuPoVoaD6HT7GjmGI2flSKzepirT9KztAX0Qg8vZbaixOBw3yhXe70qea8KCSuogtA/exec",
  perpanjangan_spk: "https://script.google.com/macros/s/AKfycbyQRhiyX-zAyIyyHHU8OASCTj9O2tCSmnNesiX9o3q9ipQjKp5Qkx_LN6UmARtWMqJe/exec",
  login_perpanjanganspk: "https://script.google.com/macros/s/AKfycbyQRhiyX-zAyIyyHHU8OASCTj9O2tCSmnNesiX9o3q9ipQjKp5Qkx_LN6UmARtWMqJe/exec"
};

async function mergePdfWithDrive(systemPdfId, userPdfBase64) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: KEYFILEPATH,
            scopes: SCOPES,
        });
        const drive = google.drive({ version: 'v3', auth });

        const systemPdfRes = await drive.files.get({
            fileId: systemPdfId,
            alt: 'media',
        }, { responseType: 'arraybuffer' });

        const systemPdfDoc = await PDFDocument.load(systemPdfRes.data);
        const userPdfDoc = await PDFDocument.load(Buffer.from(userPdfBase64, 'base64'));

        const userPages = await systemPdfDoc.copyPages(userPdfDoc, userPdfDoc.getPageIndices());
        userPages.forEach((page) => systemPdfDoc.addPage(page));

        const mergedPdfBytes = await systemPdfDoc.save();

        await drive.files.update({
            fileId: systemPdfId,
            media: {
                mimeType: 'application/pdf',
                body: Buffer.from(mergedPdfBytes),
            },
        });

        console.log(`Berhasil menggabungkan PDF untuk ID: ${systemPdfId}`);
    } catch (error) {
        console.error("Gagal menggabungkan PDF:", error);
    }
}

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(200).end();

    const form = (req.query.form || req.body.form || "").toLowerCase();
    const GAS_URL = GAS_URLS[form];

    if (!GAS_URL) {
      return res.status(400).json({ error: "Invalid or missing form ID" });
    }

    try {
      if (req.method === "GET") {
        const url = new URL(GAS_URL);
        Object.entries(req.query).forEach(([key, value]) => {
          if (key !== "form") url.searchParams.append(key, value);
        });
        const response = await axios.get(url.toString());
        return res.status(200).json(response.data);
      }

      if (req.method === "POST") {
        const postData = { ...req.body };
        const userPdfBase64 = postData.lampiran_pdf; 
        
        delete postData.lampiran_pdf; 
        delete postData.form;

        const response = await axios.post(GAS_URL, postData, {
          headers: { "Content-Type": "application/json" },
        });

        if (
            form === 'perpanjangan_spk' && 
            response.data.status === 'success' && 
            response.data.pdfId && 
            userPdfBase64
        ) {
            await mergePdfWithDrive(response.data.pdfId, userPdfBase64);
        }
        return res.status(200).json(response.data);
      }

      return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
      console.error("GAS Proxy error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      return res
        .status(500)
        .json({ error: "Gagal mengakses Google Apps Script" });
    }
  });
};
