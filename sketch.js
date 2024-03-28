/*

A farming game written in p5.js. Its supposed to be ran in the p5.js web editor though it should still work if reimplamented
on a regular web page. MIT liscense or something like that.

*/

class tile {
  constructor(sprite,state) {
    "use strict";
    this.sprite = sprite;
    this.state = state;
    this.isLocked = false;
  }
}

class animal {
  constructor(sprite,state) {
    "use strict";
    this.sprite = sprite;
    this.state = state;
    this.hunger = 100;
  }
}

class gate { //one of the red messages
  constructor(Text,size) {
    "use strict";
    this.message = Text; //text of message
    this.state = false; //if false it wont be shown, else it will
    this.size = size; //the font size of the text
  }
}

class mineTile {
  constructor(state,sprite) {
    "use strict";
    this.state = state
    this.sprite = sprite
    this.level = 0;
  }
}

class achievement {
  constructor(textCol,col,txt, x, TxTx) {
    "use strict";
    this.textCol = textCol;
    this.col = col;
    this.txt = txt;
    this.unlocked = false;
    this.x = x;
    this.TxTx = TxTx;
  }
}

let tiles = [];
let animals = [];
let mines = [];
let particles = [];
let logs = [];
let money = 9999;
let playerLevel = 9999;
let globalShift = 0; //variable that moves everything too the right and left with l/r controls
let moneyGain = 0;
const gates = [new gate("your too poor to buy discount land",25), new gate("you dont have enough money or land",22), new gate("you cant afford to buy food lmao",27), new gate("insufficient resources",30), new gate("to poor too buy a mine",25)];
const achievements = [new achievement("orange","red","M",15,25), new achievement("green","blue","L",75,90)];

function preload() {
  grass = loadImage("grass.png");
  dirt = loadImage("dirt.png");
  rock = loadImage("rock.png");
  flower = loadImage("flower.png");
  cow = loadImage("cow.png");
  sheep = loadImage("sheep.png");
  coin = loadSound("coin.wav");
  song = loadSound("music.mp3");
  molten = loadImage("molten.png");
}

function planting() {
  "use strict";
  const changes = ["grass","dirt","flower"];
  for (let i = 0; i < tiles.length; i++) {
    if (!tiles[i].isLocked)
      tiles[i].state = changes[Math.floor(Math.random() * 3)];
      switch (tiles[i].state) {
        case "grass":
          tiles[i].sprite = grass;
          break;
        case "dirt":
          tiles[i].sprite = dirt;
          break;
        case "flower":
          tiles[i].sprite = flower;  
      }
  }
  moneyGain = calculateGain();
}

function buyAnimal() {
  "use strict";
  if (money >= 100 && animals.length < tiles.length) {
    const animalList = ["cow","sheep"]
    switch (animalList[Math.floor(Math.random() * 2)]) {
      case "cow":
        animals.push(new animal(cow,"cow"));
        break;
      case "sheep":
        animals.push(new animal(sheep,"sheep"));
        break;
    }
    money-=100;
    moneyGain = calculateGain();
  } else {
    newLog("poor");
    openGate(1);
  }
}

function newLog(item) {
  "use strict";
  console.log(item);
  logs.unshift(item);
  if (logs.length > 5) logs.pop();
}

function moneyGainAndHunger() { //gives the player money and subtracts all animals hunger var on a 1 second interval
  "use strict";
  if (moneyGain > 0) {
    money+=moneyGain;
    coin.play();
  }
  for (let i = 0; i < animals.length; i++) {
    animals[i].hunger--;
  }
  moneyGain = calculateGain();
}

function lockLandFunc(lockOrUnlock,promptTxT) {
  "use strict";
  if (money >= 35) {
    let index;
    do {
      index = Number(prompt(promptTxT));
      if (isNaN(index) || index > tiles.length || index < 1 || tiles[index - 1].isLocked === lockOrUnlock) {
        newLog("invalid response");
      } else {
        tiles[index-1].isLocked = lockOrUnlocked;
        break;
      }
    } while (true);
    money -= 35;
  } else {
    newLog("your too poor lmao");
  }
}

function setup() {
  "use strict";
  let isDarkMode = false;
  const controlText = createElement("h2","controls:");
  let globalVolume = 0.5; //volume of all sounds
  setAllVolumes(globalVolume);
  song.loop();
  setInterval(moneyGainAndHunger,1000);
  tiles.push(new tile(dirt,"dirt"));
  createCanvas(400, 400);
  let levelUpCost = 50;
  const plant = createButton("plant");
  plant.mousePressed(planting);
  const buyLandDiscount = createButton("buy land at a discount");
  buyLandDiscount.mousePressed(function(){buyLand("dirt",dirt,50)});
  const buyAnimalVar = createButton("buy an animal");
  buyAnimalVar.mousePressed(buyAnimal);
  const feedAnimals = createButton("feed your animals");
  feedAnimals.mousePressed(function() {
    if (money >= 5 && animals.length > 0) {
      for (let i = 0; i < animals.length; i++) {
        animals[i].hunger = 100;
      }
      money-=5;
    } else {
      newLog("you are too poor or dont have any animals");
      openGate(2);    
    }
  });
  const buyMaccas = createButton("buy mcdonalds");
  buyMaccas.mousePressed(function() {
    if (!achievements[0].unlocked && money >= 10000) {
      achievements[0].unlocked = true;
      money-=10000;
      playerLevel++;
      newLog("you bought maccas");
    }
  });
  const sellAnimalsVar = createButton("sell your animals");
  sellAnimalsVar.mousePressed(sellAnimals);
  const buyLandExpensive = createButton("buy land");
  buyLandExpensive.mousePressed(function(){buyLand("grass",grass,75)});
  const setVolumeVar = createButton("change volume");
  setVolumeVar.mousePressed(function(){globalVolume = changeVolume(globalVolume)});
  const levelUpVar = createButton("level up");
  levelUpVar.mousePressed(function(){levelUpCost = levelUp(levelUpCost)});
  const buyMineVar = createButton("buy a mine");
  buyMineVar.mousePressed(buyMine);
  const lockLand = createButton("lock land");
  lockLand.mousePressed(function(){lockLandFunc(true,"input which land to freeze: ")});
  const unlockLand = createButton("unlock land");
  unlockLand.mousePressed(function(){lockLandFunc(false,"input which land to unfreeze: ")});
  const guiControlLabel = createElement("h2","gui controls:");
  const resizeVar = createButton("resize canvas");
  resizeVar.mousePressed(resize);
  const switchColorMode = createButton("switch to light/dark mode");
  switchColorMode.mousePressed(function(){
    if (isDarkMode) {
      guiControlLabel.style("color","black");
      controlText.style("color","black");
      saveControlLabel.style("color","black");
      isDarkMode = false;
    } else {
      guiControlLabel.style("color","white");
      controlText.style("color","white");
      saveControlLabel.style("color","white");
      isDarkMode = true;
    }
  });
  const saveControlLabel = createElement("h2","save controls:");
  const saveGame = createButton("save game");
  saveGame.mousePressed(function() {
    let saveString = saveStringGenerate();
    console.log(saveString);
    alert(saveString);
  });
  const loadGameButton = createButton("load game");
  loadGameButton.mousePressed(loadSaveString);
}

function sellAnimals() {
  "use strict";
  let count;
  do {
    count = Number(prompt("input the amount to sell"));
    if (isNaN(count) || count > animals.length || animals < 0) {
      newLog("invalid response")
    } else {
      for (let i = 0; i < count; i++)
        animals.pop();
      moneyGain = calculateGain();
      break;
    }
  } while (true);
}

function resize() {
  "use strict";
  let inp;
  do {
    inp = Number(prompt("input a value"));
    if (isNaN(inp) || inp < 1 || inp > 16500) {
      newLog("invalid response");
    } else {
      resizeCanvas(inp,400);
      break;
    }
  } while (true);
}

function buyLand(state,sprite,cost) {
  "use strict";
  if (money >= cost) {
    tiles.push(new tile(sprite,state));
    if (tiles.length === 4) {
      achievements[1].unlocked = true;
    }
    money-=cost;
    newLog("you bought cheap land");
  } else {
    newLog("poor");
    openGate(0);
  }
}

function buyMine() {
  "use strict";
  const states = ["standard","molten"];
  const sprites = [rock,molten];
  if (money > 1500 && tiles.length >= 5) {
    mines.push(new mineTile(states[Math.floor(Math.random() * 2)],sprites[Math.floor(Math.random() * 2)]));
    money -= 1500;
    newLog("you bought a mine");
    for (let i = 0; i < 5; i++) {
      tiles.pop();
    }
    let animalsToKill = animals.length - tiles.length;
    if (animalsToKill > 0) {
      for (let i = 0; i < animalsToKill; i++) {
        animals.pop();
      }
    }
  } else {
    newLog("you cant buy a mine");
    openGate(4);
  }
}

function draw() {
  "use strict";
  background("grey");
  for (let i = 0; i < (width - 300) / 100; i++) { //start particle system
    append(particles, [round(random(0, width)), -10, round(random(1, 6)), round(random(3, 6)), Math.floor(Math.random() * 10)]);
  }
  for (let i = 1; i < particles.length; i++) {
    if (particles[i - 1][4] > 4) {
        particles[i - 1][0] += particles[i - 1][2];
    } else if (particles[i - 1][4] <= 4) {
        particles[i - 1][0] -= particles[i - 1][2];
    }
    particles[i - 1][1] += particles[i - 1][3];
    fill(225, 225, 225, 50);
    noStroke();
    circle(particles[i - 1][0], particles[i - 1][1], 10);
    if (particles[i - 1][1] > height + 10) {
        particles.splice(i - 1, 1);
    }
  } //end particle system
  //draw tiles
  for (let i = 0; i < tiles.length; i++) {
    image(tiles[i].sprite,100*i+globalShift,0,100,100);
  }
  //draw money and player level
  push();
    fill("gold");
    textSize(35);
    text(money,15,35);
    fill("green");
    text(playerLevel,15,65);
  pop();
  //draw animals
  for (let i = 0; i < animals.length; i++) {
    image(animals[i].sprite,(i*100+50)+globalShift, 50,25,25);
  }
  //draw achievements
  push();
    textSize(25)
    for (let i = 0; i < achievements.length; i++) {
      if (achievements[i].unlocked) {
        fill(achievements[i].col);
        square(achievements[i].x,300,45);
        fill(achievements[i].textCol);
        text(achievements[i].txt,achievements[i].TxTx,329.5);
      } else {
        fill("black");
        square(achievements[i].x,300,45);
      }
    }
  pop();
  //draw mine tiles
  for (let i = 0; i < mines.length; i++) {
    image(mines[i].sprite,i*100+globalShift,100,100,100);
  }
  push();
    function drawRect(r,g,b,posX,posY,sizeX,sizeY) {
      fill(r,g,b);
      rect(posX,posY,sizeX,sizeY);
    }
    drawRect(85,85,85,240,240,150,150);
    drawRect(0,0,0,255,260,120,120);
    drawRect(225,0,0,262.5,242.5,15,15);
    drawRect(0,225,0,285,242.5,15,15);
    fill("green");
    for (let i = 0; i < logs.length; i++) {
      text(logs[i],255,275+i*25);
    }
  pop();
  //draw gates
  push();
      fill("red");
    for (let i = 0, z = 0; i < gates.length; i++) {
      if (gates[i].state) {
        textSize(gates[i].size);
        text(gates[i].message,5,380-z*15);
        z++;
      }
    }
  pop();
}

function openGate(id) { //displays red message for 1 second
  "use strict";
  gates[id].state = true;
  setTimeout(function(){gates[id].state = false},1000);
}

function setAllVolumes(volume) { //changes all volumes to equal var volume (only a function as it's also used at the start in setup(){})
  "use strict";
  coin.setVolume(volume);
  song.setVolume(volume);
}

function changeVolume(globalVolume) {
  "use strict";
  let volume;
  do {
    volume = Number(prompt("change volume (current volume = " + String(globalVolume*100) + ")"));
    if (isNaN(volume) || volume > 100 || volume < 0) {
      newLog("invalid response");
    } else {
      if (volume === 0) { //deals with divided by 0 error
        setAllVolumes(0);
      } else {
        setAllVolumes(volume/100);
      }
      break;
    }
  } while (true);
  return volume/100;
}

function calculateGain() {
  "use strict";
  function minesAndTiles(arr,case1,case2,plus,calculation) { //handles the calculations for mines and tiles. arr = array of things, case1/2 = the text of state, plus = amount calculation is added by in second case, calculation = current amount
    for (let i = 0; i < arr.length; i++) {
      switch(arr[i].state) {
        case case1: //state name (i.e "standard")
          calculation++;
          break;
        case case2: //state name (i.e flower)
          calculation+=plus;
          break;
      }
    }
    return calculation;
  }
  let calculation = minesAndTiles(tiles,"grass","flower",3,0); //defines variable and calls function for tiles
  for (let i = 0; i < animals.length; i++) { //checks state of all animals
    if (animals[i].hunger > 0) {
      switch (animals[i].state) {
        case "cow": calculation++; break;
        case "sheep": calculation+=2; break;
      }
    }
  }
  return minesAndTiles(mines,"standard","molten",10,calculation) + (playerLevel - 1); // returns calcuation after minesandtiles iS called for mines
}

function keyPressed() {
  "use strict";
  if (keyCode === LEFT_ARROW) globalShift-=15; //moves everything to the left
  else if (keyCode === RIGHT_ARROW) globalShift+=15; //moves everything to the right
}

function levelUp(levelUpCost) {
  "use strict";
  if (money > levelUpCost && tiles.length > 4 && animals.length > 4) {
    playerLevel++;
    return Math.floor(levelUpCost * 1.3);
  } else {
    newLog("you cant level up");
    openGate(3);
  }
}

function saveStringGenerate() {
  "use strict";
  function perNumEncryption(thingStr) {
    for (let i = 0; i < thingStr.length; i++) {
      switch (thingStr[i]) {
        case '1': saveStr += 'Q'; break;
        case '2': saveStr += 'W'; break;
        case '3': saveStr += 'E'; break;
        case '4': saveStr += 'R'; break;
        case '5': saveStr += 'T'; break;
        case '6': saveStr += 'Y'; break;
        case '7': saveStr += 'U'; break;
        case '8': saveStr += 'I'; break;
        case '9': saveStr += 'O'; break;
        case '0': saveStr += 'P'; break;
      }
    }
  }
  const chars = ['@','!','&','%'];
  const ceaser = Math.floor(Math.random() * 5);
  let saveStr = String(ceaser);
  const moneyStr = String(money).split("");
  for (let i = 0; i < moneyStr.length; i++) {
    saveStr += String.fromCharCode(Number(moneyStr[i]) + ceaser + 65);
  }
  if (saveStr.length < 11) {
    while (saveStr.length < 11) {
      saveStr += chars[Math.floor(Math.random() * 4)];
    }
  }
  saveStr += '|';
  const levelStr = String(playerLevel);
  for (let i = 0; i < levelStr.length; i++) {
    saveStr += levelStr[i] + chars[Math.floor(Math.random() * 4)];
  }
  const tileCountChange = Math.floor(Math.random() * 5) + 1;
  let grassCount = 0;
  let dirtCount = 0;
  let flowerCount = 0;
  saveStr += '|' + String(tileCountChange) + '.';
  for (let i = 0; i < tiles.length; i++) {
    switch (tiles[i].state) {
      case "grass": grassCount++; break;
      case "dirt": dirtCount++; break;
      case "flower": flowerCount++; break;
    }
  }
  saveStr += String(grassCount + tileCountChange) + '.' + String(dirtCount + tileCountChange) + '.' + String(flowerCount + tileCountChange) + '|';
  for (let i = 0; i < 4; i++) 
    saveStr += chars[Math.floor(Math.random() * 4)];
  saveStr += '.';
  let cowCount = 0;
  let sheepCount = 0;
  for (let i = 0; i < animals.length; i++) {
    switch (animals[i].state) {
      case "sheep": sheepCount++; break;
      case "cow": cowCount++; break;
    }
  }
  console.log(str(cowCount) + " =cows. " + str(sheepCount) + " =sheep");
  perNumEncryption(String(cowCount));
  saveStr += '.';
  perNumEncryption(String(sheepCount));
  return saveStr;
}

function loadSaveString() {
  function perNumDecryption(encryptedStr) {
    let numStr = "";
    for (let i = 0; i < encryptedStr.length; i++) {
      switch (encryptedStr[i]) {
        case 'Q': numStr += '1'; break;
        case 'W': numStr += '2'; break;
        case 'E': numStr += '3'; break;
        case 'R': numStr += '4'; break;
        case 'T': numStr += '5'; break;
        case 'Y': numStr += '6'; break;
        case 'U': numStr += '7'; break;
        case 'I': numStr += '8'; break;
        case 'O': numStr += '9'; break;
        case 'P': numStr += '0'; break;        
      }
    }
    return Number(numStr);
  }
  function XinArrY(X, Y) {
    for (let i = 0; i < Y.length; i++)
      if (X === Y[i]) return true;
    return false;
  }
  let saveStr = prompt("input your save string");
  if (!confirm("are you happy with" + saveStr)) return;
  if (saveStr === undefined) {
    return alert("you inputted nothing stupid");
  }
  saveStr = saveStr.split('|');
  const ceaser = saveStr[0][0];
  let moneyStr = "";
  const saltedChars = ['@','!','&','%'];
  for (let i = 1; i < saveStr[0].length; i++)
    if (!XinArrY(saveStr[0][i], saltedChars)) moneyStr += String(saveStr[0][i].charCodeAt(0) - ceaser - 65);
  money = Number(moneyStr);
  let levelStr = "";
  for (let i = 0; i < saveStr[1].length; i++)
    if (saltedChars.indexOf(saveStr[1][i]) < 0) levelStr += saveStr[1][i];
  playerLevel = Number(levelStr);
  saveStr[2] = saveStr[2].split('.');
  const tileCountChange = Number(saveStr[2][0]);
  for (let i = 0; i <  Number(saveStr[2][1]) - tileCountChange; i++)
    tiles.push(new tile(grass,"grass"));
  for (let i = 0; i < Number(saveStr[2][2]) - tileCountChange; i++)
    tiles.push(new tile(dirt,"dirt"));
  for (let i = 0; i < Number(saveStr[2][3]) - tileCountChange; i++)
    tiles.push(new tile(flower,"flower"));
  saveStr[3] = saveStr[3].split('.');
  console.log("saveStr = ", saveStr[3]);
  let cowEncryptedStr = "";
  for (let i = 3; i < saveStr[3][1].length; i++)
    cowEncryptedStr += saveStr[3][1][i];
  const decryptedCowCount = perNumDecryption(cowEncryptedStr);
  console.log(decryptedCowCount);
  for (let i = 0; i < decryptedCowCount; i++)
    animals.push(new animal(cow,"cow"));
  let sheepEncryptedStr = "";
  for (let i = 0; i < saveStr[3][2].length; i++)
    sheepEncryptedStr += saveStr[3][2][i];
  const decryptedSheepCount = perNumDecryption(sheepEncryptedStr);
  console.log(decryptedSheepCount);
  for (let i = 0; i < decryptedSheepCount; i++)
    animals.push(new animal(sheep,"sheep"));
  calculateGain();
}
