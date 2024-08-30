const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({
  path: "./.env",
});

var convertapi = require("convertapi")(process.env.PDF_TO_DOCX_API);

const app = express();
const port = 3000;

app.use(cors());

// settting up the file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
app.post("/convertFile", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file  uploaded",
      });
    }
    // Defining outout file path
    let outputPath = path.join(
      __dirname,
      "files",
      `${req.file.originalname}.pdf`
    );
    docxToPDF(req.file.path, outputPath, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Error converting docx to pdf",
        });
      }
      res.download(outputPath, () => {
        console.log("file downloaded");
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/convertPdfToDocx", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== ".pdf") {
      return res
        .status(400)
        .json({ message: "Invalid file type. Only PDF files are allowed." });
    }
    let outputPath = path.join(
      __dirname,
      "files",
      `${req.file.originalname}.docx`
    );
    convertapi
      .convert(
        "docx",
        {
          File: req.file.path,
        },
        "pdf"
      )
      .then(function (result) {
        result.saveFiles(outputPath);
        res.download(outputPath, () => {
          console.log("file downloaded");
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
