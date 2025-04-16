const finishDrawing = document.getElementById('finishButton');

finishButton.addEventListener('click', () => {
    let finishedImageContainer;
    let header;

    if (!document.getElementById('finishedImageContainer')) {
        finishedImageContainer = document.createElement('div')
        finishedImageContainer.classList.add('p-2')
        finishedImageContainer.id = "finishedImageContainer";

        header = document.createElement('h1');
        header.innerText = 'Result:';
        finishedImageContainer.appendChild(header)
        document.body.appendChild(finishedImageContainer);
    }

    const canvas = document.getElementById('defaultCanvas0');

    finishedImageContainer.scrollIntoView({behavior: "smooth"})
});