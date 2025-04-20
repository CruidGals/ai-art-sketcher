const finishDrawing = document.getElementById('finishButton');

finishButton.addEventListener('click', async () => {
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

    // Set a loading label to indicate that the image is loading
    const loadingLabel = document.createElement('div');
    loadingLabel.innerText = 'Loading the AI-ified image (may take upwards of 30 seconds)...';
    loadingLabel.classList.add('fst-italic', 'text-secondary');
    finishedImageContainer.appendChild(loadingLabel);

    finishedImage = document.createElement('img');
    finishedImage.classList.add('img-fluid');

    await fetch('http://localhost:3000/generate', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image: 'https://i.postimg.cc/YSQxY9VC/cat.png',
            prompt: 'a photo of a bright colored cat'
        })
    })
        .then(response => response.json())
        .then(data => finishedImage = data.output[0])
        .catch(err => console.error(err));

    loadingLabel.remove();
    finishedImageContainer.appendChild(finishedImage);
});

function getCanvasBase64() {
    return canvas.elt.toDataURL('image/png').split(',')[1];
}