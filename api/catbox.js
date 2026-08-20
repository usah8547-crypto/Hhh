const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const axios = require("axios");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3001;

const MAX_SIZE = 50 * 1024 * 1024;

const upload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: MAX_SIZE
  }
});

app.post(
  "/api/catbox",
  upload.single("file"),
  async (req, res) => {
    let tempFilePath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded."
        });
      }

      tempFilePath = req.file.path;

      const form = new FormData();

      form.append(
        "fileToUpload",
        fs.createReadStream(tempFilePath),
        {
          filename:
            req.file.originalname
        }
      );

      form.append(
        "reqtype",
        "fileupload"
      );

      const response =
        await axios.post(
          "https://catbox.moe/user/api.php",
          form,
          {
            headers: form.getHeaders(),
            maxContentLength:
              Infinity,
            maxBodyLength:
              Infinity,
            timeout: 120000
          }
        );

      const result =
        String(response.data || "").trim();

      if (
        !result ||
        !result.startsWith("http")
      ) {
        return res.status(500).json({
          error:
            "Catbox upload failed."
        });
      }

      return res.json({
        url: result
      });

    } catch (error) {

      console.error(
        "Catbox upload error:",
        error.message
      );

      return res.status(500).json({
        error:
          "Unable to upload file to Catbox."
      });

    } finally {

      if (
        tempFilePath &&
        fs.existsSync(tempFilePath)
      ) {
        try {
          fs.unlinkSync(
            tempFilePath
          );
        } catch {}
      }

    }
  }
);

app.listen(PORT, () => {
  console.log(
    `Catbox API running on port ${PORT}`
  );
});
