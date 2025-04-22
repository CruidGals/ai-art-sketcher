const finishDrawing = document.getElementById('finishButton');

finishButton.addEventListener('click', async (e) => {
    let finishedImageContainer;
    let finishedImage;
    let header;

    if (!document.getElementById('finishedImageContainer')) {
        finishedImageContainer = document.createElement('div');
        finishedImageContainer.classList.add('p-2');
        finishedImageContainer.id = "finishedImageContainer";

        header = document.createElement('h1');
        header.innerText = 'Result:';
        finishedImageContainer.appendChild(header);
        document.body.appendChild(finishedImageContainer);
    }

    // Get the image from canvas
    const canvas = document.getElementById('defaultCanvas0');
    const finishedImageURL = canvas.toDataURL();
    finishedImageContainer.scrollIntoView({behavior: "smooth"});

    // Get the type of model; useful for prompt engineering and image naming
    const modelLabel = document.getElementById('dropdownBoxLabel');
    const modelName = modelLabel.innerText;

    // Set a loading label to indicate that the image is loading
    const loadingLabel = document.createElement('div');
    loadingLabel.innerText = 'Loading the AI-ified image (may take upwards of 30 seconds)...';
    loadingLabel.classList.add('fst-italic', 'text-secondary');
    finishedImageContainer.appendChild(loadingLabel);
    
    // Setup the container to put the generated image
    finishedImage = document.createElement('img');
    finishedImage.classList.add('img-fluid');

    // IMAGE API STUFF
    // Upload the image to imgbb through API
    const dataURL = await uploadImage(getCanvasBase64(canvas), modelName.toLocaleLowerCase());

    // Run it through replicate API and upload image back to IMGBB
    const filePath = await generateImage(dataURL, modelName.toLocaleLowerCase());
    const generatedBase64 = await getLocalImageBase64(filePath);
    const generatedImageURL = await uploadImage(generatedBase64, modelName.toLocaleLowerCase());

    // Set the completed image and remove the loading thing
    finishedImage.src = generatedImageURL;
    loadingLabel.remove();
    finishedImageContainer.appendChild(finishedImage);
});

// Upload the base64 onto imgbb, and set an expiration so it deletes in 10 minutes (600 seconds)
async function uploadImage(base64, modelName) {

    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          name: `${modelName}_${Date.now()}`,
          expiration: 600
        })
    });

    console.log(`Successfully uploaded image ${modelName}_${Date.now()} to IMGBB.`);
    const data = await response.json();
    return data.data.url;
}

// Generate the image with ControlNet (Replicate) using the prompt and imageURL from IMGBB
async function generateImage(imageURL, modelName) {
    // Construct the prompt
    let prompt;

    if (modelName == 'everything') {
        prompt = 'Complete this image into a detailed piece of concept art, with the look and feel on a real canvas with bright pastel colors — let the shapes inspire something new.';
    } else {
        prompt = `a photo of a bright colored ${modelName}`;
    }

    const response = await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: imageURL,
            prompt: prompt
        })
    });

    console.log('Successfully generated Image using ControlNet');
    const data = await response.json();
    return data.output[0];
}

// Helper function to grab the Base64 representation from an image on local computer
async function getLocalImageBase64(filePath) {
    const response = await fetch('http://localhost:3000/base64', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            filePath: filePath
        })
    });

    const data = await response.json()
    return data.output;
}

// Helper function to grab the Base64 representation from the canvas
function getCanvasBase64(canvas) {
    const canvasEl = canvas.elt || canvas.canvas || canvas;
  
    if (!canvasEl || !canvasEl.toDataURL) {
        throw new Error('Invalid canvas element');
    }

    const dataURL = canvasEl.toDataURL('image/png');
    return dataURL.split(',')[1];
}