require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const { sendEmail } = require("./lib/emailService");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "45mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://frontend-form-virid.vercel.app", "https://script.google.com"],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/form", require("./api/form.js"));
app.use("/api/send-email", require("./api/send-email.js"));

app.get("/", (req, res) => res.send("Backend server is running correctly."));

app.get("/approval/approve", async (req, res) => {
  try {
    const { gas_url, row, approver, ulok } = req.query;

    await axios.get(`${gas_url}?action=processApproval&row=${row}&approver=${approver}`);

    const recipientDataResponse = await axios.get(`${gas_url}?action=getRecipientInfo&row=${row}`);
    const finalData = recipientDataResponse.data;

    await sendEmail("perpanjangan_spk_notification", { ...finalData, status: 'disetujui' });

    res.render("response", { status: 'success', type: 'approve', ulok });

  } catch (error) {
    console.error("Error processing approval:", error.message);
    res.render("response", { status: 'error', msg: 'Gagal memproses persetujuan.' });
  }
});

app.get("/approval/reject", (req, res) => {
    const { gas_url, row, approver, ulok } = req.query;
    res.render("rejection", { gas_url, row, approver, ulok });
});

app.post("/approval/submit-rejection", async (req, res) => {
    try {
        const { gas_url, row, approver, ulok, reason } = req.body;

        await axios.get(`${gas_url}?action=processRejection&row=${row}&approver=${approver}&reason=${encodeURIComponent(reason)}`);
        
        const recipientDataResponse = await axios.get(`${gas_url}?action=getRecipientInfo&row=${row}`);
        const finalData = recipientDataResponse.data;

        await sendEmail("perpanjangan_spk_notification", { ...finalData, status: 'ditolak' });

        res.render("response", { status: 'success', type: 'reject', ulok });

    } catch (error) {
        console.error("Error processing rejection:", error.message);
        res.render("response", { status: 'error', msg: 'Gagal memproses penolakan.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});