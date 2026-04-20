console.log("BACKEND FILE LOADED");
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

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://hoa-frontend-beta.vercel.app",
    ],
    credentials: true,
  })
);

const upload = multer({ storage: multer.memoryStorage() });
const visionClient = new vision.ImageAnnotatorClient();

//let rulesText = "";
const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://hoa-frontend-owkbu934z-pinepple772s-projects.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.options("*", cors());

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    console.log("Unexpected field:", err.field);
  }
  next(err);
});

app.get("/", (req, res) => {
  res.send("HOA backend is running");
});

console.log("UPLOAD ROUTE REGISTERED");
app.post("/api/upload-rules", upload.single("rules"), async (req, res) => {
  try {
    console.log("UPLOAD ROUTE HIT");
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    let rulesText = "";

    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      rulesText = parsed.text || "";
    } else {
      rulesText = req.file.buffer.toString("utf8");
    }

    return res.json({
      ok: true,
      chars: rulesText.length,
      text: rulesText,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: "Upload failed" });
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
- In separate paragraphs, return a concise response with a compliance score from 0-100, a list of likely violations, and reasoning for the compliancy score.
- Add very short reasoning for each criteria given in the HOA rules document.
- If there are requirements that cannot be verified from the image, note them all in one final paragraph as "unverifiable criteria".
- Separate each criterion with newlines.
- Do not use markdown, just plain text.
`;

app.post("/api/analyze-openai", upload.single("image"), async (req, res) => {
  try {
    const rulesText = req.body.rulesText;

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