const { sendEmail } = require("../lib/emailService");

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://script.google.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { formType, data } = req.body;

    if (!formType || !data) {
      return res.status(400).json({
        success: false,
        message: "formType dan data harus disediakan",
      });
    }

    const result = await sendEmail(formType, data);

    if (result.success) {
      return res.status(200).json(result);
    }

    const statusByCode = {
      GMAIL_ENV_MISSING: 500,
      GMAIL_AUTH_INVALID_GRANT: 401,
    };

    return res.status(statusByCode[result.code] || 500).json(result);
  } catch (error) {
    console.error("Error in send-email API:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
