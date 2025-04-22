require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const axios = require('axios');
const fs = require('fs');
const { writeFile } = require('fs').promises;
const path = require('path');

// Start the app
const app = express();
app.use(cors());

// Make sure it uses output folders
const outputDir = path.resolve(__dirname, '..', '..', 'outputs');
app.use('/outputs', express.static(outputDir));

// Middleware for form data handling
app.use(express.json({limit: '32mb'}));

// Create the replicate instance
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Instantiate the post request
app.post('/generate', async (req, res) => {
    const { image, prompt } = req.body;

    // Create the input
    const input = {
        seed: 20,
        image: image,
        prompt: prompt,
        structure: "scribble",
        image_resolution: 512
    }

    try {
        // Get the image
        const output = await replicate.run("rossjillian/controlnet:795433b19458d0f4fa172a7ccf93178d2adb1cb8ab2ad6c8fdc33fdbcd49f477", { input });

        console.log("Replicate output:", output); // output is an array of image URLs

        let fileUrls = []
        for (const [index, url] of Object.entries(output)) {
            const response = await axios.get(url, { responseType: 'arraybuffer' }); // get binary data
            const filename = `output_${Date.now()}_${index}.png`;
            const fileUrl = path.join(outputDir, filename);
            await writeFile(fileUrl, response.data);
            fileUrls.push(fileUrl);
            console.log(`Saved ${filename}`);
        }
        
        // How can I access the image at this directory
        res.json({output: fileUrls});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Post to imgbb
app.post('/upload', async (req, res) => {
    const { image, name, expiration } = req.body;

    try {
        const form = new FormData();
        
        // Create the form, which contains imageURl, name, and how long it will stay on IMGBB
        form.append('image', image);
        form.append('name', name);
        form.append('expiration', expiration);

        // Post image to imgbb and get the direct link to it
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
            method: 'POST',
            body: form
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Upload failed.' });
    }
});

// Use node.js modules to easily get Base64 repr from local computer files
app.post('/base64', async (req, res) => {
    const { filePath } = req.body;
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    res.json({output : base64Image});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});