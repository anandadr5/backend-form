const axios = require("axios");
const cors = require("cors")({
  origin: "https://frontend-form-virid.vercel.app", // Ganti kalau frontend beda
  methods: ["GET", "POST", "OPTIONS"],
});

const GAS_URLS = {
  "input-pic":
    "https://script.google.com/macros/s/AKfycbz9LIukypbkTyUCsYU0vz0LeGWMdAGhrG38jiloQERsPbzXReM8VjaUNdd5FrsAxtE0/exec",
  h2: "https://script.google.com/macros/s/AKfycbypYgQepRIARK-m2EDjEke4XZJ1aGFdYPlSSFK60JAf8UeB0xwkdTF2U4IpTlVc8YSOtA/exec",
  h5: "https://script.google.com/macros/s/AKfycby_37vO4R95aq3ScRUaZmVqnjOKd7lxmwMzWxAMhvLiXSODtG0ZKQCgBJVG9Y0F09ck/exec",
  h7: "https://script.google.com/macros/s/AKfycby4NBQE2oQXijsMQhG-uET-HunBeqKPS-aiuwT7kkcT9O72LA-5o8B8zJ_jF3XXNKaW/exec",
  h8: "https://script.google.com/macros/s/AKfycbzEBsmlkDVjWrvNAYyvrD9sl2Xz64XaJN-amEzgLCZKBBT41T1aznVD-GlitfMrzO0k/exec",
  h10: "https://script.google.com/macros/s/AKfycbxIuS4ka9kwj9PApSwbro4fnji-54yf8maZo5hqzBidYSRaWp494NHXv6oll2Evl7DN/exec",
};

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
        // Tambahkan semua query params, kecuali "form"
        Object.entries(req.query).forEach(([key, value]) => {
          if (key !== "form") url.searchParams.append(key, value);
        });
        const response = await axios.get(url.toString());
        return res.status(200).json(response.data);
      }

      if (req.method === "POST") {
        const response = await axios.post(GAS_URL, req.body, {
          headers: { "Content-Type": "application/json" },
        });
        return res.status(200).json(response.data);
      }

      return res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
      console.error("GAS error:", {
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
