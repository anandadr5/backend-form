const axios = require("axios");

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbw-NdGFDa4o5crGJKd_qqG3iCBJo4jqJSfzsdw06EIgV-8wIYO8XdtXFKMtjh8MLpRl/exec";

const cors = require("cors")({
  origin: "https://frontend-form-virid.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
});

module.exports = (req, res) => {
  cors(req, res, async () => {
    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
      const response = await axios.post(GAS_URL, req.body, {
        headers: { "Content-Type": "application/json" },
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error submit ke GAS:", error.message);
      res.status(500).json({
        status: "error",
        message: "Gagal submit ke GAS",
      });
    }
  });
};
