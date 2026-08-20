import axios from "axios";
import FormData from "form-data";

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

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);

    const contentType = req.headers["content-type"];

    if (!contentType) {
      return res.status(400).json({
        error: "Missing content type"
      });
    }

    const form = new FormData();

    form.append("reqtype", "fileupload");

    form.append(
      "fileToUpload",
      body,
      {
        filename: "upload",
        contentType: contentType
      }
    );

    const response = await axios.post(
      "https://catbox.moe/user/api.php",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "User-Agent":
            "Mozilla/5.0"
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000
      }
    );

    const url =
      String(response.data || "").trim();

    if (!url.startsWith("http")) {
      return res.status(500).json({
        error:
          url ||
          "Catbox did not return a valid URL"
      });
    }

    return res.status(200).json({
      url
    });

  } catch (error) {
    console.error(
      "CATBOX ERROR:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      error:
        error.response?.data ||
        error.message ||
        "Upload failed"
    });
  }
}
