const express = require("express");
const multer = require("multer");
const cors = require("cors");
const pdfParse = require("pdf-parse"); 
const vision = require("@google-cloud/vision");
const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  process.env.hoa-frontend-beta.vercel.app
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true
}));

const upload = multer({ storage: multer.memoryStorage() });
const visionClient = new vision.ImageAnnotatorClient();

let rulesText = "";

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    console.log("Unexpected field:", err.field);
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send("HOA backend is running");
});

app.post("/api/upload-rules", upload.single("rules"), async (req, res) => {
  console.log("req.file.fieldname:", req.file?.fieldname);
  console.log("req.file:", req.file);
  console.log("req.body:", req.body);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No rules file uploaded" });
    }

    if (req.file.mimetype === "application/pdf") {
      try {
        const parsed = await pdfParse(req.file.buffer);
        rulesText = parsed.text || "";
      } catch (err) {
        console.error("Failed to parse PDF:", err);
        return res.status(400).json({ error: "Could not read PDF text" });
      }
    } else {
      rulesText = req.file.buffer.toString("utf8");
    }

    res.json({ ok: true, chars: rulesText.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not read HOA rules :(" });
  }
});

app.post("/api/analyze-vision", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded..." });
    }

    const [result] = await visionClient.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations || [];

    res.json({
      labels: labels.map((l) => ({
        description: l.description,
        score: l.score,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Vision analysis failed" });
  }
});

const systemPrompt = `
You are an HOA compliance checker.

Follow these rules:
- Compare the provided HOA rules against the uploaded image.
- In separate paragraphs, return a concise response with a compliance score from 0-100, a list of likely violations, and reasoning for the compliancy score. Violations should only include criteria that can be reasonably assessed from the image. For example, if the rules say "no parking on the lawn" and the image shows a car parked on grass, that would be a likely violation and should be included. If there is no car visible, that is not a violation. If the rules say "no loud noises after 10pm" that should not be included as a violation since it can't be verified from the image at all, and should fall under the unverifiable criteria.
- Add very short reasoning for each criteria given in the HOA rules document.
- If there are requirements that cannot be verified from the image, note them all in one paragraph. This includes anything you cannot see in the image, such as sewage service requirements, pet restrictions, noise regulations, etc. Do not just ignore unverifiable criteria, explicitly state that they cannot be assessed. Unverifiable criteria should not factor into the compliance score, but should be listed in a separate paragraph as "unverifiable criteria".
- Separate each criterion with newlines. Do not use any special formatting like markdown, just plain text.
`;

// app.post("/api/analyze-openai", async (req, res) => {
//     res.status(500).json({ error: "sry bro i dont want to sped my precious cents on this rn :("})
//   }),

app.post("/api/analyze-openai", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded..." });
    }

    if (!rulesText) {
      return res.status(400).json({ error: "No HOA rules uploaded yet" });
    }

    const base64Image = req.file.buffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `HOA rules:\n\n${rulesText}\n\nCheck this property photo.` },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    res.json({ raw: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "analysis failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
