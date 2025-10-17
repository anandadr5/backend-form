require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const formHandler = require("./api/form.js");
const sendEmailHandler = require("./api/send-email.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: "45mb" }));
app.use(express.urlencoded({ limit: "45mb", extended: true }));

app.use(
  cors({
    origin: [
      "https://frontend-form-virid.vercel.app",
      "https://script.google.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/form", formHandler);
app.use("/api/send-email", sendEmailHandler);

app.get("/", (req, res) => {
  res.send("Backend server is running correctly.");
});

app.get("/approval/response", (req, res) => {
    const { status, type, ulok, msg } = req.query;
    res.render("response", { 
        status,
        type,
        ulok,
        msg
    });
});

app.get("/approval/reject", (req, res) => {
    const { gas_url, row, approver, ulok } = req.query;
    res.render("rejection", {
        gas_url,
        row,
        approver,
        ulok
    });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});