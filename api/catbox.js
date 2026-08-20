import formidable from "formidable";
import FormData from "form-data";
import fs from "fs";
import axios from "axios";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  let file;

  try {
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024
    });

    const [, files] = await form.parse(req);

    file = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!file) {
      return res.status(400).json({
        error: "No file received"
      });
    }

    const catbox = new FormData();

    catbox.append(
      "reqtype",
      "fileupload"
    );

    catbox.append(
      "fileToUpload",
      fs.createReadStream(file.filepath),
      {
        filename:
          file.originalFilename || "upload",
        contentType:
          file.mimetype ||
          "application/octet-stream"
      }
    );

    const response = await axios.post(
      "https://catbox.moe/user/api.php",
      catbox,
      {
        headers: catbox.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000
      }
    );

    const result =
      String(response.data || "").trim();

    console.log("CATBOX RESPONSE:", result);

    if (!result.startsWith("https://")) {
      return res.status(502).json({
        error:
          result ||
          "Catbox upload failed"
      });
    }

    return res.status(200).json({
      url: result
    });

  } catch (error) {
    console.error(
      "CATBOX ERROR:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      error:
        String(
          error.response?.data ||
          error.message ||
          "Upload failed"
        )
    });

  } finally {
    if (
      file?.filepath &&
      fs.existsSync(file.filepath)
    ) {
      try {
        fs.unlinkSync(file.filepath);
      } catch {}
    }
  }
}
