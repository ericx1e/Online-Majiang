// import Tile from './tile'
let socket = io.connect('http://192.168.2.179:4000/');
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
let myRoom = '';
let myName = '';
let input = '';

function preload() {
  back = loadImage('images/back.png');
  board = loadImage('images/background.jpg');
  tex = loadImage('images/background.png');
  inconsolata = loadFont('assets/Inconsolata-Black.otf');
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
  const cv = createCanvas(displayWidth, displayHeight, WEBGL);
  fullscreen(true);
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
  if(myName == '') {
    background(51);
    textAlign(CENTER,CENTER);
    textFont(inconsolata);
    textSize(70);
    fill(255);
    text("Enter your name", 0, -height/2+100);
    text(input, 0, 0);
    return;
  } else if(myRoom == '') {
    background(51);
    textAlign(CENTER,CENTER);
    textFont(inconsolata);
    textSize(70);
    fill(255);
    text("Enter a room name to create or join", 0, -height/2+100);
    text(input, 0, 0);
    return;
  }

  background(51);
  if(keys.up) {
    angle-=0.025;
  }

  if(keys.down) {
    angle+=0.025;
  }
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

let keys = {
  up: false,
  down: false,
}

function keyPressed() {
  if(key == 'ArrowUp') {
    keys.up = true;
  }
  if(key == 'ArrowDown') {
    keys.down = true;
  }
  if(myName == '') {
    if(key.length == 1) {
      input+=key;
    }
    if(key == 'Backspace') {
      input = input.substring(0, input.length-1);
    }
    if(input.length > 0 && key == 'Enter') {
      myName = input;
      socket.emit('new name', myName);
      input = '';
      return;
    }
  } else if(myRoom == '') {
    if(key.length == 1) {
      input+=key;
    }
    if(key == 'Backspace') {
      input = input.substring(0, input.length-1);
    }
    if(input.length > 0 && key == 'Enter') {
      socket.emit('create or join', input);
      input = '';
    }
  }
}

socket.on('created', (room) => {
  console.log('created room', room);
  myRoom = room;
});

socket.on('joined', (room) => {
  console.log('joined room', room);
  myRoom = room;
});

socket.on('full', (room) => {
  console.log('room', room, 'is full');
});

socket.on('otherjoined', (id) => {
  console.log(id, 'joined the room');
});


function keyReleased() {
  if(key == 'ArrowUp') {
    keys.up = false;
  }
  if(key == 'ArrowDown') {
    keys.down = false;
  }
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
