const finishDrawing = document.getElementById('finishButton');

finishButton.addEventListener('click', async (e) => {
    // let finishedImageContainer;
    // let finishedImage;
    // let header;

    // if (!document.getElementById('finishedImageContainer')) {
    //     finishedImageContainer = document.createElement('div');
    //     finishedImageContainer.classList.add('p-2');
    //     finishedImageContainer.id = "finishedImageContainer";

    //     header = document.createElement('h1');
    //     header.innerText = 'Result:';
    //     finishedImageContainer.appendChild(header);
    //     document.body.appendChild(finishedImageContainer);
    // }

    // // Get the image from canvas
    const canvas = document.getElementById('defaultCanvas0');
    // const finishedImageURL = canvas.toDataURL();
    // finishedImageContainer.scrollIntoView({behavior: "smooth"});

    // // Get the type of model; useful for prompt engineering and image naming
    const modelLabel = document.getElementById('dropdownBoxLabel');
    const modelName = modelLabel.innerText;

    // // Set a loading label to indicate that the image is loading
    // const loadingLabel = document.createElement('div');
    // loadingLabel.innerText = 'Loading the AI-ified image (may take upwards of 30 seconds)...';
    // loadingLabel.classList.add('fst-italic', 'text-secondary');
    // finishedImageContainer.appendChild(loadingLabel);

    // finishedImage = document.createElement('img');
    // finishedImage.classList.add('img-fluid');

    // // IMAGE API STUFF
    // // Upload the image to imgbb through API
    await uploadImage(canvas, modelName.toLocaleLowerCase());

    // // Run it through replicate API

    // finishedImage.src = filePath;
    
    // loadingLabel.remove();
    // finishedImageContainer.appendChild(finishedImage);
});

async function uploadImage(canvas, modelName) {
    const base64 = getCanvasBase64(canvas);
    console.log(base64.length);
    
    const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          name: `${modelName}_${Date.now()}`,
          expiration: 60
        })
    });

    console.log(`Successfully uploaded canvas to IMGBB.`);
    const data = await response.json();
    return data.data.url;
}

function getCanvasBase64(canvas) {
    const canvasEl = canvas.elt || canvas.canvas || canvas;
  
    if (!canvasEl || !canvasEl.toDataURL) {
        throw new Error('Invalid canvas element');
    }

    const dataURL = canvasEl.toDataURL('image/png');
    return dataURL.split(',')[1];
}
