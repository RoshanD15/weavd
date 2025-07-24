require('dotenv').config();
const express = require('express');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const app = express();

app.use(cors());
app.use(express.json());

const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

app.post('/vision', async (req, res) => {
  const { imageUrls } = req.body;
  console.log("Got request for:", imageUrls); // <--- Add this line!
  try {
    const results = await Promise.all(imageUrls.map(async (url) => {
      const [result] = await client.labelDetection(url);
      const labels = result.labelAnnotations?.map(l => l.description) || [];
      return { url, labels };
    }));
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});