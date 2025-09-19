require("dotenv").config();
const express = require("express");
const cors = require("cors");
const formHandler = require("./api/form.js");
const sendEmailHandler = require("./api/send-email.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://frontend-form-virid.vercel.app",
      "https://script.google.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use("/api/form", formHandler);

app.use("/api/send-email", sendEmailHandler);

app.get("/", (req, res) => {
  res.send("Backend server is running correctly.");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
