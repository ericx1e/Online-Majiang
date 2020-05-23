// import Tile from './tile'
let socket = io.connect('http://192.168.2.178:4000/');
let back;
let board;
let tex;
let tileImages = new Map();
let pieceNames = ['m', 'p', 's'];
let extraPieceNames = ['dg', 'dr', 'dw', 'we', 'wn', 'ws', 'ww'];
let tileWidth = 60 / 1920;
let tileHeight = 80 / 1920;
let tileDepth = 40 / 1920;
let hand = [];
let myRoom = '';
let myName = '';
let input = '';
let tableWidth = 1500 / 1920;
let tableDepth = 1500 / 1080;
let tableHeight = 200;
let selected;
let otherHands = new Map();
let otherPlayers = [];
let message;
let messageStartFrame;
let whosturn = '';
let playTileButton;
let buttons = [];
let gameStarted = false;
let playedTiles = [];

function preload() {
  back = loadImage('images/back.png');
  board = loadImage('images/background.jpg');
  tex = loadImage('images/background.png');
  inconsolata = loadFont('assets/Inconsolata-Black.otf');
  pieceNames.forEach((item, i) => {
    for (var n = 1; n <= 9; n++) {
      tileImages.set(item + n, loadImage('images/' + item + n + '.png'));
    }
  });

  extraPieceNames.forEach((item, i) => {
    tileImages.set(item, loadImage('images/' + item + '.png'));
  });
}

function setup() {
  const cv = createCanvas(1920, 1080, WEBGL);
  tableWidth *= 1920;
  tableDepth *= 1080;
  tileWidth *= 1920;
  tileDepth *= 1920;
  tileHeight *= 1920;
  console.log(displayWidth, displayHeight);
  // fullscreen(true);
  imageMode(CENTER);
  cv.position(0, 0);

  playTileButton = new Button(-width / 2 + 100, -height / 2 + 100, 150, 50, "Play Tile");
  pongButton = new Button(-width / 2 + 300, -height / 2 + 100, 150, 50, "Pong");
  chitButton = new Button(-width / 2 + 500, -height / 2 + 100, 150, 50, "Chi");
  buttons.push(playTileButton);
  buttons.push(pongButton);
  buttons.push(chitButton);
}

socket.on('startgame', () => {
  gameStarted = true;
  newMessage('game started');
  for (var i = 0; i < 13; i++) {
    socket.emit('requesttile', myRoom);
  }

  for (var i = 0; i < otherPlayers.length; i++) {
    let h = [];
    for (var j = 0; j < 13; j++) {
      h.push(new DummyTile(i - 1));
    }
    otherHands.set(otherPlayers[i], h);
  }
});

socket.on('givetile', (name, tileId) => {
  if (name == myName) {
    let i = 0;
    let t = new Tile(tileId, i * tileWidth - 13 * tileWidth / 2 + i * 2 + tileWidth / 2 - 13, -tileHeight / 2, -tableDepth / 2 + 175);
    hand.push(t);
    updatePositions();
  } else {
    // otherHands.get(name).push(new DummyTile(0));
  }
});

socket.on('playedtile', (name, tileId) => {
  playedTiles.push(new PlayedTile(tileId, 0, 0, 0));
});

let angle = 70 * Math.PI / 180;

function draw() {
  // if(key == ' ')
  // orbitControl();
  if (myName == '') {
    background(51);
    textAlign(CENTER, CENTER);
    textFont(inconsolata);
    textSize(70);
    fill(255);
    text("Enter your name", 0, -height / 2 + 100);
    text(input, 0, 0);
    return;
  } else if (myRoom == '') {
    background(51);
    textAlign(CENTER, CENTER);
    textFont(inconsolata);
    textSize(70);
    fill(255);
    text("Enter a room name to create or join", 0, -height / 2 + 100);
    text(input, 0, 0);
    return;
  }

  background(51);
  lights();
  push();
  translate(0, 0, -200);
  rotateX(angle);
  image(board, 0, 0, tableWidth, tableDepth);
  translate(0, 0, -100);
  texture(tex);
  textureMode(IMAGE);
  box(tableWidth, tableDepth, tableHeight - 1);
  pop();
  rectMode(CENTER);
  noStroke();
  if (hand.length > 0) {
    hand.some((item, i) => {
      if (item != undefined) {
        item.show();
      }
    });
  }

  if (selected != undefined) {
    selected[0].highlight();
  }

  // plane(150);
  // angle += 0.07;
  otherHands.forEach((value, key, map) => {
    let hand = value;
    hand.forEach((item, j) => {
      item.x = j * tileWidth - 13 * tileWidth / 2 + j * 2 + tileWidth / 2 - 13;
      item.y = tileHeight * 1.5;
      item.z = -tableDepth / 2.5;
      item.show();
    });
  });

  otherPlayers.forEach((item, i) => {
    push();
    rotateX(PI / 2 + angle);
    rotateZ(PI);
    translate(0, -tableHeight / 2, 0);
    rotateY((i - 1) * PI / 2);
    translate(0, -100, tableDepth / 2);
    if (whosturn == item) {
      // stroke(255, 0, 0);
      directionalLight(255, 255, 0, 0, 1, 0);
    }
    noStroke();
    fill(150);
    push();
    translate(0, 150, 150);
    sphere(100);
    push();
    translate(0, 200, 0);
    cylinder(50, 400);
    pop();
    // if(whosturn == item) {
    //   push();
    //   translate(0, -250, -200);
    //   fill(255, 0, 0);
    //   cone(50, 60);
    //   pop();
    // }
    pop();
    rotateY(PI);
    fill(255);
    textAlign(CENTER, CENTER);
    textFont(inconsolata);
    textSize(100);
    fill(255);
    text(item, 0, 0);
    // box(100, 100, 100);
    pop();
  });

  if (gameStarted) {
    updateButtons();
  }
  showMessage();
  drawPlayedTiles();
}

function drawPlayedTiles() {
  playedTiles.forEach((item, i) => {
    item.x = tileWidth/2*12/2 - (i%12) * tileWidth / 2;
    item.z = -tileHeight + 11;
    item.y = -tileHeight/2*12/2 + tileHeight/2  * Math.floor(i / 12);
    item.show();
  });

}

function updateButtons() {
  buttons.forEach((item, i) => {
    item.show();
  });
  if (playTileButton.down) {
    if (whosturn == myName) {
      if (selected == undefined) {
        newMessage('Please select a tile');
      } else {
        hand.splice(selected[1], 1);
        socket.emit('turn', myRoom, selected[0].type);
        selected = undefined;
        updatePositions();
      }
    } else {
      // newMessage("It's not your turn");
    }
  }

  if (playedTiles.length == 0) {
    return;
  }
  let lastPlayedTile = playedTiles[playedTiles.length - 1];
  if (pongButton.down) {
    console.log("buh");
    let count = 0;
    hand.forEach((item, i) => {
      if (item.type == lastPlayedTile.type) {
        count++;
      }
    });
    if (count == 2) {
      socket.emit('pong', myRoom, lastPlayedTile.type);
      hand.forEach((item, i) => {
        if (item.type == lastPlayedTile.type) {
          hand.splice(i, 1);
        }
      });
      updatePositions();
    } else {
      newMessage('not enough tiles');
    }
  }
}

socket.on('pong', name, tileId) {

}

function newMessage(msg) {
  message = msg;
  messageStartFrame = frameCount;
}

function showMessage() {
  let n = frameCount - messageStartFrame;
  if (n > 255) {
    message = '';
  }
  push();
  textAlign(CENTER, CENTER);
  textFont(inconsolata);
  textSize(50);
  fill(255, 255 - n);
  text(message, 0, -height / 2 + 100);
  pop();
}

function updatePositions() {
  let n = hand.length;
  for (var i = 0; i < n; i++) {
    hand[i].x = i * tileWidth - n * tileWidth / 2 + i * 2 + tileWidth / 2 - n;
  }
}

function keyPressed() {
  if (myName == '') {
    if (key.length == 1) {
      input += key;
    }
    if (key == 'Backspace') {
      input = input.substring(0, input.length - 1);
    }
    if (input.length > 0 && key == 'Enter') {
      myName = input;
      socket.emit('new name', myName);
      input = '';
      return false;
    }
  } else if (myRoom == '') {
    if (key.length == 1) {
      input += key;
    }
    if (key == 'Backspace') {
      input = input.substring(0, input.length - 1);
    }
    if (input.length > 0 && key == 'Enter') {
      socket.emit('create or join', input);
      input = '';
    }
  }
  if (key == 'q') {
    if (angle == -PI / 8) {
      angle = 70 * Math.PI / 180;
    } else {
      angle = -PI / 8
    }
  }
}

function keyReleased() {
  console.log("wtf");
}

socket.on('created', (room) => {
  console.log('created room', room);
  newMessage('created room ' + room);
  myRoom = room;
});

socket.on('joined', (room, others) => {
  console.log('joined room', room);
  newMessage('joined room ' + room);
  myRoom = room;
  otherPlayers = others;
});

socket.on('full', (room) => {
  console.log('room', room, 'is full');
  newMessage('room ' + room + ' is full');
});

socket.on('otherjoined', (id) => {
  if (id != myName) {
    otherPlayers.push(id);
  }
  console.log(id, 'joined the room');
  newMessage(id + ' joined room');
});

socket.on('otherleft', (id) => {
  let index = otherPlayers.indexOf(id);
  if (index > -1) {
    otherPlayers.splice(index, 1);
  }
  console.log(id, 'left the room');
});

socket.on('whosturn', (id) => {
  whosturn = id;
  if (whosturn == myName) {
    newMessage('your turn');
    if (gameStarted) {
      socket.emit('requesttile', myRoom);
    }
  }
});

function keyReleased() {}


function mousePressed() {

  hand.some((item, i) => {
    // console.log(dist(0*tileWidth-tileWidth/2, height-tileHeight*2, mouseX, mouseY));
    if (dist(2.5 * i * tileWidth + (13 - hand.length) * tileWidth, height - tileHeight * 2, 0, mouseX, mouseY, 0) < tileWidth * 2) {
      if (selected == undefined) {
        selected = [item, i];
      } else {
        if (selected[1] == i) {
          selected = undefined
        } else {
          // hand[selected[1]] = undefined;
          // hand[selected[1]] = new Tile(item.image, selected[0].x, selected[0].y, selected[0].z);
          // hand[i] = new Tile(selected[0].image, hand[i].x,hand[i].y,hand[i].z);
          hand.splice(selected[1], 1);
          if (i == hand.length) {
            hand.push(new Tile(selected[0].type, 0, item.y, item.z));
          } else {
            hand.splice(i, 0, new Tile(selected[0].type, 0, item.y, item.z));
            hand.join();
          }
          updatePositions();
          selected = undefined;
        }
      }
      return true;
    }
  });

  buttons.forEach((item, i) => {
    item.checkClicked();
  });
}

function mouseReleased() {
  buttons.forEach((item, i) => {
    item.down = false;
  });
}

class Tile {
  constructor(image, x, y, z) {
    this.image = tileImages.get(image);
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = image;
  }

  highlight() {
    push();
    rotateX(PI / 2 + angle);
    rotateZ(PI);
    push();
    translate(-this.x, this.y, this.z + tileDepth / 2 + 1);
    noFill();
    stroke(255, 0, 0);
    box(tileWidth + 2, tileHeight + 2, tileDepth + 2);
    pop();
    pop();
  }

  show() {
    push();
    rotateX(PI / 2 + angle);
    rotateZ(PI);
    push();
    translate(-this.x, this.y, this.z + tileDepth / 2 + 1);
    fill(255);
    box(tileWidth, tileHeight, tileDepth);
    pop();
    push();
    translate(-this.x, this.y, this.z + tileDepth / 8 * 7.5);
    fill(0, 200, 0);
    box(tileWidth + 0.1, tileHeight + 0.1, tileDepth / 4);
    pop();
    push();
    rotateY(PI);
    translate(0, 0, -this.z);
    image(this.image, this.x, this.y, tileWidth, tileHeight);
    // console.log(this.image);
    pop();
    // push();
    // translate(0, 0, tileDepth + 2);
    // image(back, this.x, this.y, tileWidth, tileHeight);
    // pop();
    pop();
  }
}

class PlayedTile {
  constructor(image, x, y, z) {
    this.image = tileImages.get(image);
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = image;
  }
  show() {
    push();
    rotateX(angle);
    // rotateY(PI);
    // rotateZ(PI);
    push();
    translate(-this.x, this.y, this.z + tileDepth / 2 + 1);
    fill(255);
    box(tileWidth / 2, tileHeight / 2, tileDepth / 2);
    pop();
    push();
    translate(-this.x, this.y, this.z + tileDepth / 4 / 8 * 7.5);
    fill(0, 200, 0);
    box(tileWidth / 2 + 0.1, tileHeight / 2 + 0.1, tileDepth / 2 / 4);
    pop();
    push();
    rotateY(PI);
    translate(this.x, this.y, -this.z - tileDepth / 2 - 11.1);
    rotateY(PI);
    image(this.image, 0, 0, tileWidth / 2, tileHeight / 2);
    // console.log(this.image);
    pop();
    // push();
    // translate(0, 0, tileDepth + 2);
    // image(back, this.x, this.y, tileWidth, tileHeight);
    // pop();
    pop();
  }
}

class DummyTile {
  constructor(n) {
    this.n = n;
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  show() {
    push();
    rotateX(PI / 2 + angle);
    rotateZ(PI);
    translate(0, -tableHeight / 2, 0);
    rotateY(this.n * PI / 2 - PI);
    // if (this.n == 0) {
    //   rotateY(PI / 4);
    // }
    push();
    translate(-this.x, this.y, this.z + tileDepth / 2 + 1);
    fill(255);
    box(tileWidth, tileHeight, tileDepth);
    pop();
    push();
    translate(-this.x, this.y, this.z + tileDepth / 8 * 7.5);
    fill(0, 200, 0);
    box(tileWidth + 0.1, tileHeight + 0.1, tileDepth / 4);
    pop();
    // push();
    // translate(0, 0, tileDepth + 2);
    // image(back, this.x, this.y, tileWidth, tileHeight);
    // pop();
    pop();
  }
}

class Button {
  constructor(x, y, w, h, text) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.down = false;
  }

  show() {
    push();
    rectMode(CENTER);
    if (this.down) {
      fill(120);
    } else {
      fill(160);
    }
    rect(this.x, this.y, this.w, this.h);
    textAlign(CENTER, CENTER);
    textFont(inconsolata);
    textSize(30);
    fill(255);
    text(this.text, this.x, this.y);
    pop();
  }

  checkClicked() {
    this.down = (mouseX - width / 2 > this.x - this.w / 2 && mouseX - width / 2 < this.x + this.w / 2 && mouseY - height / 2 > this.y - this.h / 2 && mouseY - height / 2 < this.y + this.h / 2);
    return this.down;
  }
}
