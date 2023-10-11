const size = 4;
const tableCells = createTable();
const startBtn = document.getElementById('start-btn');
const soundBtn = document.getElementById('sound-btn');
const footerBtn = document.getElementById('footer-btn');
const github = document.getElementById('github');
const rsschool = document.getElementById('rsschool');
const year = document.getElementById('year');
const rulesCheckbox=document.getElementById('rules-btn');
const resultsCheckbox = document.getElementById('results-btn');
const level1 = document.getElementById('level1');
const level2 = document.getElementById('level2');
const radio = document.querySelector('.radio');
const rulesContent = document.querySelector('.rules-table');
const resultsContent = document.querySelector('.results-table');

let values;
let emptyX, emptyY;
let left = { dx: -1, dy: 0 };
let right = { dx: 1, dy: 0 };
let up = { dx: 0, dy: -1 };
let down = { dx: 0, dy: 1 };

const minutesContainer = document.getElementById("minutes");
const secondsContainer = document.getElementById("seconds");
const millisecondsContainer = document.getElementById("milliseconds");

let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let interval;


// CREATE TABLE
function createTable() {
  const cells = [];
  const table = document.getElementById('table');

  for (let y = 0; y < size; y++) {
    const tr = document.createElement('tr');
    table.appendChild(tr);
    const rowCells = [];
    cells.push(rowCells);
    for (let x = 0; x < size; x++) {
      const td = document.createElement('td');
      td.setAttribute('class', 'cell');
      td.setAttribute('id', `cell-${y}-${x}`); // add id for each cell

      // move by clicking on a cell
      td.addEventListener('click', function () {
        const cellId = this.id;
        const coordinates = cellId.split('-');
        const clickedY = parseInt(coordinates[1]);
        const clickedX = parseInt(coordinates[2]);
        const dx = clickedX - emptyX;
        const dy = clickedY - emptyY;
        const move = { dx, dy };
        makeMove(move);
        draw();
        if (gameOver()) {
          stopTimer();
        }
      });

      tr.appendChild(td);
      rowCells.push(td);
    }
  }
  return cells;
}

// ADD VALUES FROM 1 TO 15
function reset() {
  emptyX = emptyY = size - 1;
  // create array with values from 1 to 15
  let v = [];
  let i = 1;
  for (let y = 0; y < size; y++) { 
    let rowValues = [];
    v.push(rowValues);
    for (let x = 0; x < size; x++) {
      rowValues.push(i);
      i++;
    }
  }
  v[emptyY][emptyX] = 0;
  return v;
}

// DRAW THE TABLE
function draw() {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = values[y][x];
      let td = tableCells[y][x];

      if (v === 0) {
        // one cell is empty
        td.innerHTML = '';
      } else {
        // set cell numbers
        td.innerHTML = String(v);
      }
    }
  }
}

// SWAP AN EMPTY CELL WITH ANOTHER CELL NEXT TO
function makeMove(move) {
  // check if startBtn is checked
  if (!startBtn.checked) {
    return false;
  }

  let newX = emptyX + move.dx, newY = emptyY + move.dy;
  if ((newX >= size) || (newX < 0) ||
    (newY >= size) || (newY < 0))
  {
    return false;
   }

  // Check that the movement only occurs to an adjacent cell
  if ((Math.abs(move.dx) === 1 && move.dy === 0) || (move.dx === 0 && Math.abs(move.dy) === 1)) {
    let c = values[newY][newX];
    values[newY][newX] = 0;
    values[emptyY][emptyX] = c;
    emptyX = newX;
    emptyY = newY;

    if (!soundBtn.checked) {
      playMoveSound();
    }

    return true;
  }

  return false; // Return false if the movement is not performed
}

// SHUFFLE CELLS USING FISHER-YATES SHUFFLE - LEVEL 2
function shuffle2() {
  let valuesFlat = values.flat(); // Convert a 2D array to a 1D array
  let currentIndex = valuesFlat.length, randomIndex, tempValue;

  // While there are elements left to shuffle
  while (currentIndex !== 0) {
    // Select a random index
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Swap the elements
    tempValue = valuesFlat[currentIndex];
    valuesFlat[currentIndex] = valuesFlat[randomIndex];
    valuesFlat[randomIndex] = tempValue;
  }

  // Update the 2D array with shuffled values
  let currentIndexFlat = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      values[y][x] = valuesFlat[currentIndexFlat];
      currentIndexFlat++;
    }
  }

  // Find the index of the empty cell in the 1D array
  let emptyIndex = valuesFlat.indexOf(0);
  // Convert it to coordinates in the 2D array
  emptyX = emptyIndex % size;
  emptyY = Math.floor(emptyIndex / size);

  draw(); // / Redraw the table (game board)
}

// SHUFFLE FOR LEVEL 1
function shuffle1() {
  const moves = [up, down, left, right];
  const numShuffles = 40; // Количество перемешиваний

  for (let i = 0; i < numShuffles; i++) {
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    makeMove(randomMove);
  }

  draw(); // Перерисовываем поле после перемешивания
}


// MOVE CELLS WITH KEYBOARD
document.addEventListener('keydown', function (e) {
  let moved = false; // Flag to check the success of the move

  switch (e.keyCode) {
    case 40: 
      moved = makeMove(up);
      break;
    case 38: 
      moved = makeMove(down);
      break;
    case 39:
      moved = makeMove(left);
      break;
    case 37:
      moved = makeMove(right);
      break;
  }

  if (moved) {
    draw(); // Redraw the board only if the move was successful
  }
  // After each movement check if the game over or not 
  if (gameOver()) {
    stopTimer();
  }
});

// CHECK IF GAME IS OVER - ALL CELLS SHOULD CONTAIN CORRECT VALUES
function gameOver() {
  let expectedValue = 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (values[y][x] === expectedValue) {
        expectedValue++;
      } else {
        // game over
        if (x === size - 1 && y === size - 1 && values[y][x] === 0) {
          if (startBtn.checked) {
            saveGameTime();
            displayGameResults();
            
          }
          startBtn.checked = false;
          level1.disabled = false;
          level2.disabled = false;
          return true;
        }
        
        return false;
      } 
    }
  }
  if (startBtn.checked) {
    saveGameTime();
    displayGameResults();
  }
  startBtn.checked = false;
  level1.disabled = false;
  level2.disabled = false;
  return true;
}

// START/END GAME - CHANGE START BUTTON STATE (CHECKED/UNCHECKED)
startBtn.addEventListener('change', function () {
  if (startBtn.checked) {
    level1.disabled = true;
    level2.disabled = true;

    init();
    if (level1.checked) {
      shuffle1();
    }
    else if (level2.checked) {
      shuffle2();
    }
    // shuffle(); // shuffle cells and start game
    startTimer();
  } else {
    level1.disabled = false;
    level2.disabled = false;

    init(); // inactive state

  }
});

// ADD EVENT LISTENER FOR EACH CELL BEFORE THE GAME WAS STARTED - SHAKE-ANIMATION
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const td = tableCells[y][x];

    td.addEventListener('click', function () {
      if (!startBtn.checked) {
        if (!soundBtn.checked) {
          playShakeSound();
        }
        startBtn.classList.add('shake-animation');
        startBtn.classList.add('green-color'); // to change color
      }
    });
  }
}

// DELETE SHAKE-ANIMATION CLASS
startBtn.addEventListener('animationend', function () {
  startBtn.classList.remove('shake-animation');
  startBtn.classList.remove('green-color'); 
});

// PLAY MOVE-SOUND
function playMoveSound() {
  const moveSound = document.getElementById('moveSound');
  moveSound.currentTime = 1;
  moveSound.play();
}

// PLAY SHAKE-SOUND
function playShakeSound() {
  const shakeSound = document.getElementById('shakeSound');
  shakeSound.currentTime = 0;
  shakeSound.play();
}

// STOPWATCH
const startTimer = () => {
  clearInterval(interval);
  interval = setInterval(startWatch, 10);
}

const stopTimer = () => {
  clearInterval(interval);
}

const resetTimer = () => {
  milliseconds = 0;
  seconds = 0;
  minutes = 0;
  millisecondsContainer.innerHTML = '00';
  secondsContainer.innerHTML = '00';
  minutesContainer.innerHTML = '00';
  clearInterval(interval);
}

function startWatch() {
  milliseconds++;
  if (milliseconds < 10) {
    milliseconds.innerHTML = `0${milliseconds}`;
  }
  else if (milliseconds > 59) {
    seconds++;
    milliseconds = 0;
    millisecondsContainer.innerHTML = '00';
  }
  else {
    millisecondsContainer.innerHTML = milliseconds;
  }

  if (seconds < 10) {
    secondsContainer.innerHTML = `0${seconds}`;
  }
  else if (seconds > 59) {
    minutes++;
    seconds = 0;
    secondsContainer.innerHTML = seconds;
  }
  else {
    secondsContainer.innerHTML = seconds;
  }

  if (minutes < 10) {
    minutesContainer.innerHTML = `0${minutes}`;
  }
  else {
    minutesContainer.innerHTML = minutes;
  }
}

// SAVE GAME TIME TO LOCAL STORAGE
function saveGameTime() {
  // Get game time
  let gameTime = {
    minutes: minutesContainer.innerHTML,
    seconds: secondsContainer.innerHTML,
    milliseconds: millisecondsContainer.innerHTML
  };
  // Total game time in milliseconds
  let totalMilliseconds = gameTime.minutes * 60 * 1000 + gameTime.seconds * 1000 + gameTime.milliseconds;
  // Get the game level
  let gameLevel = level1.checked ? 'Level 1' : 'Level 2';
   // Get array from the Local Storage for the specific level
  let gameTimes = JSON.parse(localStorage.getItem(gameLevel)) || [];
  // Add game time to the array, sort and slice up to 10 results
  gameTimes.push({ gameTime, totalMilliseconds });
  gameTimes.sort((a, b) => a.totalMilliseconds - b.totalMilliseconds);
  gameTimes = gameTimes.slice(0, 10);
  // Save the updated array in Local Storage for the specific level
  localStorage.setItem(gameLevel, JSON.stringify(gameTimes));
}

// DISPLAY RESULTS
function displayGameResults() {
  let results = document.querySelector('.results');
  let resultsTitle = document.querySelector('.results-table h3');
  // Get the game level
  let gameLevel = level1.checked ? 'Level 1' : 'Level 2';
  results.innerHTML = '';
  resultsTitle.innerHTML = `Top 10 for ${gameLevel}`;
  // Get the array from Local Storage for the specific level
  let gameTimes = JSON.parse(localStorage.getItem(gameLevel)) || [];
  // Add game results to HTML
  for (let i = 0; i < gameTimes.length; i++) {
    let time = gameTimes[i].gameTime;
    results.innerHTML += `<span>${i+1} - ${time.minutes}:${time.seconds}:${time.milliseconds}</span>`;
  }
}

// SHOW GAME RESULTS OR GAME RULES
rulesCheckbox.addEventListener("change", ()=> {
  if (rulesCheckbox.checked) {
      resultsCheckbox.disabled = false; 
      rulesContent.style.transform="rotateY(0deg)";
      resultsContent.style.transform="rotateY(180deg)";
      resultsCheckbox.checked = false;      
      rulesCheckbox.disabled = true; 
  }

  else {
    if (!resultsCheckbox.checked) {
      resultsContent.style.transform = "rotateY(180deg)";
    }
  }
});

resultsCheckbox.addEventListener("change", ()=> {
  if (resultsCheckbox.checked) {
    rulesCheckbox.disabled = false; 
    resultsContent.style.transform="rotateY(0deg)";
    rulesContent.style.transform="rotateY(180deg)";
    rulesCheckbox.checked = false;
    resultsCheckbox.disabled = true; 
  }

  else {
    if (!rulesCheckbox.checked) {
      rulesContent.style.transform = "rotateY(180deg)";
    }
  }
});
  
// SHOW FOOTER ICONS 
footerBtn.addEventListener("click", () => {
  if (footerBtn.checked) {
    github.style.visibility = "visible";
    github.style.right = "0px";
    github.style.bottom = "80px";

    rsschool.style.visibility = "visible";
    rsschool.style.right = "60px";
    rsschool.style.bottom = "60px";

    year.style.visibility = "visible";
    year.style.right = "80px";
    year.style.bottom = "0px";
  }
  else {
    github.style.right = "0px";
    github.style.bottom = "0px";
    rsschool.style.right = "0px";
    rsschool.style.bottom = "0px";
    year.style.right = "0px";
    year.style.bottom = "0px";
    github.style.visibility = "hidden";
    rsschool.style.visibility = "hidden";
    year.style.visibility = "hidden";
  }
});

// RADIO TOGGLE
function setGameLevel(level){
  if(level === 'level1'){
    radio.classList.add('level1-selected');
    radio.classList.remove('level2-selected');
    displayGameResults();
  } else {
    radio.classList.add('level2-selected');
    radio.classList.remove('level1-selected');
    displayGameResults();
  }
}

// INITIALIZE THE GAME
function init() {
  values = reset();
  draw();
  resetTimer();
  displayGameResults();
}

// At the end of the code:
init(); 
