const axios = require("axios");

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbydTEquxczZEBtnYEaKBxnvdNH_mPPBjTILhG8xWNKxXMpVqLzxtFuz-xdhzbCoRYwRiQ/exec";

const cors = require("cors")({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
});

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const query = req.query;
      const url = new URL(GAS_URL);
      Object.keys(query).forEach((key) =>
        url.searchParams.append(key, query[key])
      );

      const response = await axios.get(url.toString());
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error get-data dari GAS:", error.message);
      res.status(500).json({
        status: "error",
        message: "Gagal ambil data dari GAS",
      });
    }
  });
};
