require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');
const axios = require('axios');
const { writeFile } = require('fs').promises;
const path = require('path');

// Start the app
const app = express();
app.use(cors());
app.use(express.json());

// Make sure it uses output folders
const outputDir = path.resolve(__dirname);
app.use('/outputs', express.static(outputDir));

// Create the replicate instance
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Instantiate the post request
app.post('/generate', async (req, res) => {
    const image = req.body.image;
    const prompt = req.body.prompt;

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

        let fileUrls = [];
        for (const [index, url] of Object.entries(output)) {
            const response = await axios.get(url, { responseType: 'arraybuffer' }); // get binary data
            const filename = `outputs/output_${Date.now()}_${index}.png`;
            await writeFile(filename, response.data);
            console.log(`Saved} ${filename}`);
            fileUrls.push(`https://${process.env.KOYEB_APP_NAME}.koyeb.app/${filename}`);
        }

        res.json({output: fileUrls});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// app.post('/test', async (req, res) => {
//     const imagePath = 'outputs/example.png';

//     try {
        
//         // Output into filePath
//         const filename = `outputs/output_${Date.now()}_1.png`;
//         const fullPath = path.join(outputDir, filename);

//         await writeFile(fullPath, buffer);
//         console.log(`Saved ${filename}`);
//         res.json({ filePath: fullPath });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

app.get('/test', (req, res) => {
    const filePath = path.join(outputDir, 'outputs/example.png');
    res.send(filePath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});