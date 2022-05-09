//For person detection
// let video;
// let detector;
// let detections = [];

// function preload() {
//   detector = ml5.objectDetector('cocossd');
// }

// function gotDetections(error, results) {
//   if (error) {
//     console.error(error);
//   }
//   detections = results;
//   detector.detect(video, gotDetections);
// }


//the width of the grid
const width= 3;

var boardState= [
    [[0,0,0], [0,0,0], [0,0,0]],
    [[0,0,0], [0,0,0], [0,0,0]],
    [[0,0,0], [0,0,0], [0,0,0]]
];

var gridId=[2,2];

let amt;

let col, prevcolor, newcolor;
let accposy=0, accposz=0, accposx=0;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // video = createCapture(VIDEO);
  // video.size(640, 480);
  // video.hide();
  // detector.detect(video, gotDetections);
  amt=0;
  col=color(0,0,0);
  newcolor=color(0,0,0);
  prevcolor=color(0,0,0);
  
  //Sound
  osc = new p5.Oscillator('sine');
  cVerb = createConvolver('assets/concrete-tunnel.mp3');
  osc.connect(cVerb);
}

//To change color gradually
function smoothstep(edge0, edge1, x) {
    x = constrain((x - edge0) / (edge1 - edge0), 0.0, 1.0); 
    return x * x * (3 - 2 * x);
}

//let prevpersons=-1;

let FlashParity=0;

function playOscillator() {
  osc.freq(300+FlashParity*100+50,0.1);
  osc.amp(1,0.05);
  osc.start();
  playing = true;
  stopOscillator();
}

function stopOscillator(){
  osc.amp(0, 0.05);
  playing = false;
}

let checkaccel=0;

function draw() {  
  newcolor=color(boardState[gridId[0]][gridId[1]][0],boardState[gridId[0]][gridId[1]][1],boardState[gridId[0]][gridId[1]][2]);
if (newcolor.levels[0]!=col.levels[0]||newcolor.levels[1]!=col.levels[1]||newcolor.levels[2]!=col.levels[2]){
    amt=0.0;
    prevcolor=color(col.levels);
    col=color(newcolor.levels);
    FlashParity=(FlashParity+1)%2;
    playOscillator();
  }
  

  //background(lerpColor(prevcolor, col, smoothstep(0.1,0.8,amt)));
  amt+=0.01;
  checkaccel=checkaccel+1;
  background(0,0,255);
  noStroke();
  ambientLight(0, 0, 0);
  pointLight(lerpColor(prevcolor, col, smoothstep(0.1,0.7,amt)), 0, 0, 600);
  if (checkaccel>=25){
      accposy=accelerationY;
      accposx=accelerationX;
      checkaccel=0;
  }
  //pointLight(lerpColor(prevcolor, col, smoothstep(0.1,0.7,amt)), accposy*200, accposz*200, 600);
  pointLight(lerpColor(prevcolor, col, smoothstep(0.1,0.7,amt)), accposx*10, accposy*10, 510);
  specularMaterial(250);
  shininess(5);
  sphere(500);
  
  //textSize(32);
  //text(gridId, 10, 30);
  //Counting the number of people we see
  // let persons=3;
  // for (let i = 0; i < detections.length; i++) {
  //   let object = detections[i];
  //   if (object.label=="person"){
  //     persons=persons+1;
  //   }
  // }
  // if (prevpersons!=persons && connected!=0){
  //   var str=JSON.stringify({gridId0: gridId[0],   gridId1:gridId[1], clicked: 0, persons: persons});
  // serverConnection.send(str);
  //   prevpersons=persons;
  // }
}


function touchStarted () {
  var fs = fullscreen();
  if (!fs) {
    fullscreen(true);
  }
  else{
  SendClick();
  }
}

/* full screening will change the size of the canvas */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function SendClick(){
  //var str=JSON.stringify({gridId0: gridId[0], gridId1:gridId[1], clicked: 1, persons: prevpersons});
  var str=JSON.stringify({gridId0: gridId[0], gridId1:gridId[1], clicked: 1});
  serverConnection.send(str);
}



//Websocket
const serverAddress= 'wss://serverflashingefficient.glitch.me/'
//const serverAddress= 'wss://127.0.0.1:5500'
//const serverAddress= 'wss://localhost:5500/'


const serverConnection = new WebSocket(serverAddress);

let connected=0;
serverConnection.onopen = function () {
  console.log('connecting');
  //serverConnection.send(JSON.stringify({gridId0: gridId[0], gridId1:gridId[1], clicked: 0, persons: 0}));
  serverConnection.send(JSON.stringify({gridId0: gridId[0], gridId1:gridId[1], clicked: 0}));
  connected=1;
}


serverConnection.onmessage=function(event){
  const obj=JSON.parse(event.data);
  if (boardState[gridId[0]][gridId[1]][0]!=obj.boardState[gridId[0]][gridId[1]][0]||boardState[gridId[0]][gridId[1]][1]!=obj.boardState[gridId[0]][gridId[1]][1]||boardState[gridId[0]][gridId[1]][2]!=obj.boardState[gridId[0]][gridId[1]][2]){
    boardState[gridId[0]][gridId[1]][0]=obj.boardState[gridId[0]][gridId[1]][0];
    boardState[gridId[0]][gridId[1]][1]=obj.boardState[gridId[0]][gridId[1]][1];
    boardState[gridId[0]][gridId[1]][2]=obj.boardState[gridId[0]][gridId[1]][2];
    console.log('boardstate ', boardState[gridId[0]][gridId[1]][0]);
  }
}

