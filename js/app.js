let gameData = [
 {
   image: "millhouse.png"
 },
 {
   image: "lisa-simpson.jpg"
 },
 {
   image: "homer.jpg"
 },
 {
   image: "smithers.jpg"
 },
 {
   image: "marge.png"
 },
 {
   image: "maggie.jpeg"
 },
 {
   image: "nelson.jpeg"
 },
 {
   image: "bart.jpeg"
 }
];

let gameSaveData = {
  timeStart: 0,
  timeEnd: 0,
  numberOfMoves: 0,
}

function initializeGame() {
  gameSaveData.timeStart = Date.now();
  gameSaveData.numberOfMoves = 0;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;
  console.log("START!");

  let gameBoard = document.querySelector("#game-board");

  // https://stackoverflow.com/questions/683366/remove-all-the-children-dom-elements-in-div/683429
  while (gameBoard.hasChildNodes()) {
    gameBoard.removeChild(gameBoard.lastChild);
  }

  let cards = new Array();
  let i = 0;

  for (let card of gameData) {
    console.log(card.image);
    let newCard = document.createElement('div');
    newCard.classList.add('card');
    let newCardImg = document.createElement('div');
    newCardImg.style.cssText = `background-image: url(./images/${card.image});`;
    newCardImg.classList.add(`type-${i}`)
    newCard.appendChild(newCardImg);
    cards.push(newCard);
    cards.push(newCard.cloneNode(true));
    i++;
  }
  console.log("BEGIN CARDS");
  console.log(cards);
  console.log("END CARDS");
  // https://www.w3schools.com/js/js_array_sort.asp
  cards.sort(function(a, b){return 0.5 - Math.random()});
  console.log("BEGIN RANDOMIZED CARDS");
  console.log(cards);
  console.log("END CARDS");

  for (let card of cards) {
    gameBoard.appendChild(card);
  }
}

initializeGame();

function flipCard(card) {
  console.log(`CARD:${card.classList}`);
  card.classList.toggle('turned-over-intermediate');
  card.classList.toggle('turned-over');
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
  window.setTimeout(realCardFlip.bind(null, card), 1000);
}

function realCardFlip(card) {
  console.log("HIIIII: " + card.classList);
  card.classList.toggle('turned-over-intermediate');
}
function flipCards() {
  let turnedOvers = document.querySelectorAll('.turned-over div');
  turnedOvers[0].parentElement.classList.toggle('turned-over');
  turnedOvers[1].parentElement.classList.toggle('turned-over');
}

function checkMatch() {
  let turnedOvers = document.querySelectorAll('.turned-over div');

  let cardType1 = '';
  let cardType2 = '';

  for (let c of turnedOvers[0].classList) {
    console.log("first card class: " + c);
    if (c.startsWith('type')) {
      cardType1 = c;
    }
  }
  for (let c of turnedOvers[1].classList) {
    console.log("second card class: " + c);
    if (c.startsWith('type')) {
      cardType2 = c;
    }
  }

  console.log(`card 1 is ${cardType1}, card 2 is ${cardType2}`);
  if (cardType1 === cardType2) {
    turnedOvers[0].parentElement.classList.add('match');
    turnedOvers[1].parentElement.classList.add('match');
  }

  return cardType1 === cardType2;
}

function checkWin() {
  if (document.querySelectorAll('.card').length ===
      document.querySelectorAll('.match').length) {
    console.log("you win!");
    document.querySelector('#game').classList.toggle('winner');
    gameSaveData.timeEnd= Date.now();
    window.setTimeout(youWin, 2000);
  } else {
    console.log("more cards to match still!");
  }
}

function youWin() {
  console.log("YOU WINNNNNN");
  document.querySelector('#game').style.display = "none";
  document.querySelector('#winner').style.display = "block";
  let gameStats = document.querySelector('.game-stats');
  let timeElapsedInMinutes = (gameSaveData.timeEnd - gameSaveData.timeStart) / 60000;
  let gameTime = 0.0;
  let gameTimeUnits = "seconds";

  if (timeElapsedInMinutes >= 1.0) {
    gameTime = ((gameSaveData.timeEnd - gameSaveData.timeStart) / 60000).toFixed(2);
    gameTimeUnits = "minutes";
  } else {
    gameTime = ((gameSaveData.timeEnd - gameSaveData.timeStart) / 1000).toFixed(2);
  }

  gameStats.textContent = `The game took ${gameTime} ${gameTimeUnits} and ${gameSaveData.numberOfMoves} moves.`;
  gameStats.classList.toggle('pulsate');
  document.querySelector('#winner button').addEventListener('click', function(event) {
    document.querySelector('#game').style.display = "block";
    document.querySelector('#winner').style.display = "none";
    document.querySelector('#game').classList.remove('winner');

    initializeGame();
  })
}


let gameBoard = document.querySelector('#game-board');
gameBoard.addEventListener('click', function(event) {
  let turnedOvers = document.querySelectorAll('.turned-over');
  console.log(`a card was clicked,  there are currently ${turnedOvers.length} cards flipped over`);

  if (!event.target.classList.contains('card')) {
    console.log(`Not a card, ignore click`);
    return;
  }

  if (event.target.classList.contains('match') ||
      event.target.classList.contains('turned-over')) {
    console.log(`Turned over card, ignore click`);
    return;
  }

  gameSaveData.numberOfMoves++;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;

  if (turnedOvers.length == 0) {
    console.log('flipping a card');
    flipCard(event.target);
  } else if (turnedOvers.length == 1) {
    console.log('flipping a card');
    flipCard(event.target);
    console.log("two cards flipped, check if there's a match");
    if (checkMatch()) {
      // check if a match
      console.log("sleep time");
      console.log("");
      window.setTimeout(flipCards, 1000);
      checkWin();
    } else {
      console.log('Sorry, no match!');
      console.log("sleep time");
      window.setTimeout(flipCards, 2000);
    }
  } else if (turnedOvers.length == 2) {
    // don't flip anything in this case
    console.log('Already two cards flipped');
  } else {
    // shouldn't get here
  }
});
