const clearButton = document.getElementById('clearButton');
const sketchButton = document.getElementById('sketchButton');
const dropdownBoxLabel = document.getElementById('dropdownBoxLabel');

let sketchRNN;
let modelLoaded = false;
let modelName = 'cat';
let currentStroke;
let x, y;
let nextPen = 'down';
let seedPath = [];
let isDrawing = false;

function startDrawing() {
  x = mouseX;
  y = mouseY;
  isDrawing = true;
}

function doneDrawing() {
  isDrawing = false;
}

function startSketching() {
  nextPen = 'down';
  sketchRNN.reset();
  sketchRNN.generate(seedPath, gotStrokePath);
}

clearButton.addEventListener('click', () => {
  background(220);
  currentStroke = null;
  sketchRNN.reset();
  seedPath = [];
  isDrawing = false;
  nextPen = 'down';
});

sketchButton.addEventListener('click', () => {
  if (modelLoaded) {
    startSketching();
  }
});

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  background(220);
  sketchRNN = ml5.sketchRNN(modelName, modelReady);

  canvas.mousePressed(startDrawing);
  canvas.mouseReleased(doneDrawing);

}

function modelReady() {
  console.log('model loaded.');
  modelLoaded = true;
}

function switchModel(name) {
  if (modelName != name) {
    modelName = name;
    modelLoaded = false;
    sketchRNN = ml5.sketchRNN(modelName, modelReady);
    dropdownBoxLabel.innerText = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  }
}

function gotStrokePath(error, strokePath) {
  if (error) {
    console.log(error);
    return;
  }

  currentStroke = strokePath;
  console.log(currentStroke);
}

function draw() {

  stroke(0);
  strokeWeight(5);

  if (isDrawing) {
    let strokePath = {
      dx: mouseX - pmouseX,
      dy: mouseY - pmouseY,
      pen: 'down'
    }

    line(x, y, x + strokePath.dx, y + strokePath.dy);
    x += strokePath.dx;
    y += strokePath.dy;

    seedPath.push(strokePath);
  }

  if (currentStroke) {
    if (nextPen == 'end') {
      currentStroke = null;
      return;
    }

    if (nextPen == "down") {
      line(x, y, x + currentStroke.dx, y + currentStroke.dy);
      seedPath.push(currentStroke);
    }

    x += currentStroke.dx;
    y += currentStroke.dy;

    nextPen = currentStroke.pen
    currentStroke = null;
    sketchRNN.generate(gotStrokePath);
  }
}
