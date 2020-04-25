function setup() {
  const cv = createCanvas(windowWidth, windowHeight);
  cv.position(0, 0);
}

function draw() {
  background(51);
  noStroke();
  ellipse(mouseX, mouseY, 100, 100);
}