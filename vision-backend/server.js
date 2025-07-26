require('dotenv').config();
const express = require('express');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const app = express();
const allowedOrigins = [
  "https://weavd.vercel.app", // Production
  "http://localhost:3000"  // Development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));


const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIAL);
const client = new vision.ImageAnnotatorClient({ credentials });


function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map(x =>
      Math.round(x || 0).toString(16).padStart(2, '0')
    ).join('')
  );
}

app.post('/vision', async (req, res) => {
  const { imageUrls } = req.body;
  try {
    const results = [];
    for (const url of imageUrls) {
      const [labelResult] = await client.labelDetection(url);
      const [logoResult]  = await client.logoDetection(url);
      const [colorResult] = await client.imageProperties(url);

      const labels = labelResult.labelAnnotations?.map(l => l.description) || [];
      const brands = logoResult.logoAnnotations?.map(l => l.description) || [];
      const colors = colorResult.imagePropertiesAnnotation?.dominantColors?.colors?.map(c =>
        rgbToHex(c.color.red, c.color.green, c.color.blue)
      ) || [];

      results.push({ url, labels, brands, colors });
    }
    res.json({ results });
  } catch (err) {
    console.error('Vision API error:', err);
    res.status(500).json({ error: 'Vision API error' });
  }
});

app.get('/test-vision', async (req, res) => {
  const testUrl = "https:/../firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/path%2Fto%2Ffile.png?alt=media&token=...";
  try {
    const [result] = await client.labelDetection(testUrl);
    const labels = result.labelAnnotations
      ? result.labelAnnotations.map(l => l.description)
      : [];
    res.json({ testUrl, labels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Vision backend running on port ${PORT}`);
});