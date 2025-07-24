require('dotenv').config();
const express = require('express');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));


const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

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
  const testUrl = "https://tijpxhgdqcwofkaaxqri.supabase.co/storage/v1/object/public/post-photos/68c1be82-43db-4cd7-b648-431810fa7321/1753301861170-Screenshot%20(35).png";
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