const axios = require("axios");
const FormData = require("form-data");
const formidable = require("formidable");
const fs = require("fs");

const API_KEY =
  "53acd9031dbc65e69bafff8d293e22a4";

export const config = {
  api: {
    bodyParser: false
  }
};

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  let uploadedFile = null;

  try {

    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 32 * 1024 * 1024
    });

    const [, files] =
      await form.parse(req);

    uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: "No image received."
      });
    }

    /*
     * Read image
     */

    const imageBuffer = fs.readFileSync(
      uploadedFile.filepath
    );

    /*
     * ImgBB expects base64 image
     */

    const base64 =
      imageBuffer.toString("base64");

    const uploadForm = new FormData();

    uploadForm.append(
      "image",
      base64
    );

    /*
     * Upload to ImgBB
     */

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${API_KEY}`,
      uploadForm,
      {
        headers:
          uploadForm.getHeaders(),

        maxBodyLength: Infinity,
        maxContentLength: Infinity,

        timeout: 120000
      }
    );

    /*
     * Check response
     */

    if (
      !response.data ||
      !response.data.data ||
      !response.data.data.url
    ) {

      return res.status(502).json({
        success: false,
        error:
          "ImgBB did not return an image URL."
      });

    }

    const imageUrl =
      response.data.data.url;

    /*
     * Return URL
     */

    return res.status(200).json({

      success: true,

      url: imageUrl,

      display_url:
        response.data.data.display_url,

      delete_url:
        response.data.data.delete_url,

      filename:
        uploadedFile.originalFilename,

      size:
        uploadedFile.size,

      mime:
        uploadedFile.mimetype

    });

  } catch (error) {

    console.error(
      "IMGBB API ERROR:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        error.response?.data?.error?.message ||
        error.response?.data?.error ||
        error.message ||
        "ImgBB upload failed."

    });

  } finally {

    /*
     * Delete temporary file
     */

    if (
      uploadedFile?.filepath &&
      fs.existsSync(
        uploadedFile.filepath
      )
    ) {

      try {
        fs.unlinkSync(
          uploadedFile.filepath
        );
      } catch {}

    }

  }
};
