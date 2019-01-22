const DEBUG = true;

// console.log but you you turn it off if DEBUG set to false
function debug(str) {
  if (DEBUG) {
    console.log(`DEBUG: ` + str);
  }
}

// Game card data, currently only image names but could include other metadata.
// Depends on images being stored in images/ subdirectory.
// Allows us to dynamically build the game board by adding/removing images
// rather than hardcoding in the HTML.
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

// Game data:
//   * timeStart - when the game started
//   * timeEnd - when the game ended
//   * numberOfMoves - number of cards flipped over
let gameSaveData = {
  timeStart: 0,
  timeEnd: 0,
  numberOfMoves: 0,
}

// Initialize a game - called when you first visit the page and if you play
// again after winning.
function initializeGame() {
  debug("Initializing the game...");
  debug("Reset start time and number of moves");

  // reset the game data
  gameSaveData.timeStart = Date.now();
  gameSaveData.numberOfMoves = 0;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;

  let gameBoard = document.querySelector("#game-board");

  // Remove all the cards, we'll create a new randomized board later.
  // https://stackoverflow.com/questions/683366/remove-all-the-children-dom-elements-in-div/683429
  while (gameBoard.hasChildNodes()) {
    gameBoard.removeChild(gameBoard.lastChild);
  }

  // Store the built up cards HTML so we can randomize it
  let cards = new Array();
  let i = 0;

  // Build the card HTML - each card is created twice and gets a type-n class
  // which is what we check for matches.
  for (let card of gameData) {
    debug("adding card: " + card.image);
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

  // Board changes every game
  // https://www.w3schools.com/js/js_array_sort.asp
  cards.sort(function(a, b){return 0.5 - Math.random()});

  for (let card of cards) {
    gameBoard.appendChild(card);
  }
}

initializeGame();

// flip a card over
function flipCard(card) {
  card.classList.toggle('turned-over-intermediate');
  card.classList.toggle('turned-over');
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
  window.setTimeout(removeCardHighlight.bind(null, card), 1000);
}

// remove a card's highlight (flipped over cards are highlighted)
function removeCardHighlight(card) {
  card.classList.toggle('turned-over-intermediate');
}

// flip cards when two cards are turned over.
// For non-matches, their flipped face down.  For matches, they're not
// considered turned over anymore even though they're face up.
function flipCards() {
  let turnedOvers = document.querySelectorAll('.turned-over div');
  turnedOvers[0].parentElement.classList.toggle('turned-over');
  turnedOvers[1].parentElement.classList.toggle('turned-over');
}

// Check if the 2 current turned over cards are a match.
function checkMatch() {
  let turnedOvers = document.querySelectorAll('.turned-over div');

  let cardType1 = '';
  let cardType2 = '';

  for (let c of turnedOvers[0].classList) {
    debug("first card class: " + c);
    if (c.startsWith('type')) {
      cardType1 = c;
    }
  }
  for (let c of turnedOvers[1].classList) {
    debug("second card class: " + c);
    if (c.startsWith('type')) {
      cardType2 = c;
    }
  }

  // If we have a match, tag the cards as matched which will keep them face-up
  if (cardType1 === cardType2) {
    turnedOvers[0].parentElement.classList.add('match');
    turnedOvers[1].parentElement.classList.add('match');
  }

  return cardType1 === cardType2;
}

// Check if the user won the game
function checkWin() {
  if (document.querySelectorAll('.card').length ===
      document.querySelectorAll('.match').length) {
    debug("all cards matched");
    document.querySelector('#game').classList.toggle('winner');
    gameSaveData.timeEnd= Date.now();
    window.setTimeout(youWin, 2000);
  } else {
    debug("more cards to match still");
  }
}

// Show the win screen
function youWin() {
  debug("YOU WIN!");
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
}

// Main game play, listen for clicks on the game baord which contains all the cards.
document.querySelector('#game-board').addEventListener('click', function(event) {
  let turnedOvers = document.querySelectorAll('.turned-over');
  debug(`Click event fired, there are currently ${turnedOvers.length} cards flipped over`);

  if (!event.target.classList.contains('card')) {
    debug(`Not a card, ignore click`);
    return;
  }

  if (event.target.classList.contains('match') ||
      event.target.classList.contains('turned-over')) {
    debug(`clicked on a matched or turned over card, ignore click`);
    return;
  }

  gameSaveData.numberOfMoves++;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;

  if (turnedOvers.length == 0) {
    debug('flipping a card');
    flipCard(event.target);
  } else if (turnedOvers.length == 1) {
    debug('flipping a card');
    flipCard(event.target);
    debug("two cards flipped, check if there's a match");

    if (checkMatch()) {
      // check if a match
      debug("cards match, sleep then flip cards");
      window.setTimeout(flipCards, 1000);
      checkWin();
    } else {
      debug('no match, sleep then flip cards');
      window.setTimeout(flipCards, 2000);
    }
  } else if (turnedOvers.length == 2) {
    // don't flip anything in this case
    debug('Already two cards flipped');
  } else {
    // shouldn't get here
  }
});

// Let the user play again
document.querySelector('#winner button').addEventListener('click', function(event) {
  document.querySelector('#game').style.display = "block";
  document.querySelector('#winner').style.display = "none";
  document.querySelector('#game').classList.remove('winner');

  initializeGame();
});
