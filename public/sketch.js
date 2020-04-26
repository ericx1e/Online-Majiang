// import Tile from './tile'

let back;
let board;
let tex;
let pieces = [];
let pieceNames = ['m', 'p', 's'];
let extraPieceNames = ['dg', 'dr', 'dw', 'we', 'wn', 'ws', 'ww'];
const tileWidth = 60;
const tileHeight = 80;
const tileDepth = 40;
let hand = [];

function preload() {
  back = loadImage('images/back.png');
  board = loadImage('images/background.jpg');
  tex = loadImage('images/background.png');
  pieceNames.forEach((item, i) => {
    for (var n = 1; n <= 9; n++) {
      pieces.push(loadImage('images/' + item + n + '.png'));
    }
  });

  extraPieceNames.forEach((item, i) => {
    pieces.push(loadImage('images/' + item + '.png'));
  });

}

function setup() {
  const cv = createCanvas(windowWidth, windowHeight, WEBGL);
  imageMode(CENTER);
  cv.position(0, 0);
  for (var i = 0; i < 13; i++) {
    let t = new Tile(pieces[Math.floor(Math.random() * pieces.length)], i * tileWidth-13*tileWidth/2+i*2, -tileHeight / 2, -250);
    hand.push(t);
  }
}

let angle = 30 * Math.PI / 180;
let index = 0;

function draw() {
  background(51);
  angle = (mouseX-500)/500;
  lights();
  push();
  translate(0, 0, -200);
  rotateX(angle);
  image(board, 0, 0, windowWidth, windowHeight);
  translate(0, 0, -100);
  // fill(0, 100, 0);
  texture(tex);
  textureMode(IMAGE);
  box(windowWidth, windowHeight, 199);
  pop();
  // noStroke();
  // normalMaterial();
  rectMode(CENTER);
  noStroke();
  // fill(255);
  // rotateX(angle * 0.5);
  // rotateY(angle * 0.3);
  // rotateZ(angle * 0.3);
  // image(b, -windowWidth/2, -windowHeight/2, windowWidth, windowHeight);
  // rect(0, 0, 150, 150);
  // if (frameCount % 20 == 0) {
  //   t = new Tile(pieces[index++], 0, -tileHeight / 2);
  // }
  // index %= pieces.length;
  // t.show();
  if (hand.length > 0) {
    hand.forEach((item, i) => {
      item.show();
    });
  }

  // plane(150);
  // angle += 0.07;
}

class Tile {
  constructor(image, x, y, z) {
    this.image = image;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  show() {
    push();
    rotateX(PI / 2 + angle);
    rotateZ(PI);
    push();
    translate(-this.x, this.y, this.z+tileDepth / 2 + 1);
    fill(255);
    box(tileWidth, tileHeight, tileDepth);
    pop();
    push();
    translate(-this.x, this.y, this.z+tileDepth / 8 * 7.5);
    fill(0, 200, 0);
    box(tileWidth + 0.1, tileHeight + 0.1, tileDepth / 4);
    pop();
    push();
    rotateY(PI);
    translate(0, 0, -this.z);
    image(this.image, this.x, this.y, tileWidth, tileHeight);
    pop();
    // push();
    // translate(0, 0, tileDepth + 2);
    // image(back, this.x, this.y, tileWidth, tileHeight);
    // pop();
    pop();
  }
}
