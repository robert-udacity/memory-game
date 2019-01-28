const DEBUG = true;
const CARD_TOP = 'homer-card-icon.png';
const CARD_IMAGES_LOCATION= './images';

// console.log but you can turn it off if DEBUG set to false
function debug(str) {
  if (DEBUG) {
    console.log(`DEBUG: ` + str);
  }
}

// Game card data:
//   * image: the image to use for the card.  Depends on images being stored in
//     CARD_IMAGES_LOCATION.
//   * id: unique identifier for the card
//   * class: the type of card, multiple cards can have the same class
//
// Allows us to dynamically build the game board by adding/removing images
// rather than hardcoding in the HTML.
const gameData = [
 {
   image: "millhouse.png",
   id: "millhouse-1",
   class: "type-millhouse",
 },
 {
   image: "millhouse.png",
   id: "millhouse-2",
   class: "type-millhouse",
 },
 {
   image: "lisa-simpson.jpg",
   id: "lisa-1",
   class: "type-lisa",
 },
 {
   image: "lisa-simpson.jpg",
   id: "lisa-2",
   class: "type-lisa",
 },
 {
   image: "homer.jpg",
   id: "homer-1",
   class: "type-homer",
 },
 {
   image: "homer.jpg",
   id: "homer-2",
   class: "type-homer",
 },
 {
   image: "smithers.jpg",
   id: "smithers-1",
   class: "type-smithers",
 },
 {
   image: "smithers.jpg",
   id: "smithers-2",
   class: "type-smithers",
 },
 {
   image: "marge.png",
   id: "marge-1",
   class: "type-marge",
 },
 {
   image: "marge.png",
   id: "marge-2",
   class: "type-marge",
 },
 {
   image: "maggie.jpeg",
   id: "maggie-1",
   class: "type-maggie",
 },
 {
   image: "maggie.jpeg",
   id: "maggie-2",
   class: "type-maggie",
 },
 {
   image: "nelson.jpeg",
   id: "nelson-1",
   class: "type-nelson",
 },
 {
   image: "nelson.jpeg",
   id: "nelson-2",
   class: "type-nelson",
 },
 {
   image: "bart.jpeg",
   id: "bart-1",
   class: "type-bart",
 },
 {
   image: "bart.jpeg",
   id: "bart-2",
   class: "type-bart",
 }
];

let gameCards = [];

// Game data:
//   * timeStart - when the game started
//   * timeEnd - when the game ended
//   * numberOfMoves - number of cards flipped over
//   * stars - number of stars
const gameSaveData = {
  timeStart: 0,
  timeEnd: 0,
  numberOfMoves: 0,
  stars: 3,
}

// Return the turned over card objects
function getTurnedOvers(cards) {
  debug("getTurnedOvers()---")
  const turnedOvers = [];

  for (const card of cards) {
    if (card.turnedOver) {
      debug("adding turned over card: " + card.id);
      turnedOvers.push(card);
    }
  }

  if (turnedOvers.length == 0) {
    debug("No turned over cards");
  }

  return turnedOvers;
}

// Initialize a game - called when you first visit the page and if you play
// again after winning.
function initializeGame() {
  debug("Initializing the game...");
  debug("Reset start time, number of moves, and stars");

  // reset the game data
  gameCards = [];
  gameSaveData.timeStart = Date.now();
  gameSaveData.numberOfMoves = 0;
  gameSaveData.stars = 3;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;
  for (const star of document.querySelectorAll('.fa-star')) {
    star.classList.add('checked');
  }

  const gameBoard = document.querySelector("#game-board");

  // Remove all the cards, we'll create a new randomized board later.
  // https://stackoverflow.com/questions/683366/remove-all-the-children-dom-elements-in-div/683429
  while (gameBoard.hasChildNodes()) {
    gameBoard.removeChild(gameBoard.lastChild);
  }

  // Array-ify the game data
  for (const card of gameData) {
    debug("adding card: " + card.image);
    gameCards.push({id: card.id,
                    class: card.class,
                    image: card.image,
                    turnedOver: false,
                    matched: false});
  }

  // Board changes every game
  // https://www.w3schools.com/js/js_array_sort.asp
  gameCards.sort(function(a, b){return 0.5 - Math.random()});

  // Build up the card HTML and it to the game board
  for (const gameCard of gameCards) {
    debug("adding card: " + gameCard.image);
    const newCard = document.createElement('li');
    newCard.classList.add('card');
    newCard.classList.add('turned-down');
    newCard.classList.add(`${gameCard.class}`)
    newCard.setAttribute('id', `${gameCard.id}`);
    gameBoard.appendChild(newCard);
  }
}

initializeGame();

// Adjust the user's star ratings based on number of moves:
//   * start with 3 stars
//   * 0 - 16 moves == 3 stars
//   * 17 - 25 moves == 2 stars
//   * 26 - 34 moves == 1 stars
//   * 35 and more moves == 0 stars
function adjustStars() {
  debug("adjustStars()---")
  if (gameSaveData.numberOfMoves <= 16) {
    gameSaveData.stars = 3;
  } else if (gameSaveData.numberOfMoves >= 17 && gameSaveData.numberOfMoves <= 25) {
    document.querySelector('#star-3').classList.remove('checked');
    gameSaveData.stars = 2;
  } else if (gameSaveData.numberOfMoves >= 26 && gameSaveData.numberOfMoves <= 34) {
    document.querySelector('#star-2').classList.remove('checked');
    gameSaveData.stars = 1;
  } else if (gameSaveData.numberOfMoves >= 35) {
    document.querySelector('#star-1').classList.remove('checked');
    gameSaveData.stars = 0;
  }

  debug("number of stars: " + gameSaveData.stars);
}

// flip a card over
function flipCard(card) {
  debug("flipCard()---")
  gameSaveData.numberOfMoves++;
  document.querySelector('#number-of-moves').textContent = gameSaveData.numberOfMoves;
  adjustStars();
  // Give card intermediate state for animation border, turn it face up, and
  // remove face down class.
  card.classList.add('turned-up-intermediate');
  card.classList.add('turned-up');
  card.classList.remove('turned-down');

  for (const c of gameCards) {
    if (card.id === c.id) {
      c.turnedOver = true;
      card.style.backgroundImage = `url(${CARD_IMAGES_LOCATION}/${c.image})`;
      debug("turned over " + c.id);
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
  window.setTimeout(removeCardHighlight.bind(null, card), 1000);
}

function flipDown(card) {
  debug("flipDown()---")

  card.classList.remove('turned-up');

  for (const c of gameCards) {
    if (card.id === c.id) {
      c.turnedOver = false;

      if (!card.classList.contains('match')) {
        card.classList.add('turned-down');
        // clear the flipped over card image
        card.style.cssText = '';
      }
      debug("flip down" + c.id);
    }
  }
}

// remove a card's highlight (flipped over cards are highlighted)
function removeCardHighlight(card) {
  card.classList.remove('turned-up-intermediate');
}

// flip cards when two cards are turned over.
// For non-matches, they're  flipped face down.  For matches, they're not
// considered turned over anymore even though they're face up.
function flipCards() {
  debug("flipCards()---");
  const turnedOvers = document.querySelectorAll('.turned-up');

  flipDown(turnedOvers[0]);
  flipDown(turnedOvers[1]);
}

// Check if the 2 current turned over cards are a match.
function checkMatch() {
  debug("checkMatch()---");
  const [card1, card2] = getTurnedOvers(gameCards);

  const isMatch = card1.class === card2.class;

  // If we have a match, tag the cards as matched which will keep them face-up
  if (isMatch) {
    document.getElementById(card1.id).classList.add('match');
    document.getElementById(card2.id).classList.add('match');
  }

  debug("card1.class: " + card1.class);
  debug("card2.class: " + card2.class);
  debug("match? : " + (isMatch));

  return isMatch;
}

// Check if the user won the game
function checkWin() {
  debug("checkWin()---")
  if (document.querySelectorAll('.card').length ===
      document.querySelectorAll('.match').length) {
    debug("all cards matched");
    document.querySelector('#game').classList.add('winner');
    gameSaveData.timeEnd= Date.now();
    window.setTimeout(youWin, 2000);
  } else {
    debug("more cards to match still");
  }
}

// Show the win screen
function youWin() {
  debug("youWin()---")
  document.querySelector('#game').style.display = "none";
  document.querySelector('#winner').style.display = "block";

  const gameStats = document.querySelector('.game-stats');
  const timeElapsedInMinutes = (gameSaveData.timeEnd - gameSaveData.timeStart) / 60000;
  let gameTimeUnits = "seconds";
  let gameTime = 0.0;

  if (timeElapsedInMinutes >= 1.0) {
    gameTime = ((gameSaveData.timeEnd - gameSaveData.timeStart) / 60000).toFixed(2);
    gameTimeUnits = "minutes";
  } else {
    gameTime = ((gameSaveData.timeEnd - gameSaveData.timeStart) / 1000).toFixed(2);
  }

  gameStats.textContent = `The game took ${gameTime} ${gameTimeUnits} and ${gameSaveData.numberOfMoves} moves and you scored ${gameSaveData.stars} stars!`;
}

// Main game play, listen for clicks on the game baord which contains all the cards.
document.querySelector('#game-board').addEventListener('click', function(event) {
  debug("click event handler on #game-board---")
  const turnedOvers = getTurnedOvers(gameCards);
  debug(`Click event fired, there are currently ${turnedOvers.length} cards flipped over`);

  if (!event.target.classList.contains('card')) {
    debug(`Not a card, ignore click`);
    return;
  }

  if (event.target.classList.contains('match') ||
      event.target.classList.contains('turned-up')) {
    debug(`clicked on a matched or turned over card, ignore click`);
    return;
  }

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

// const the user play again
document.querySelector('#winner button').addEventListener('click', function(event) {
  debug("click event handler on #winner button---")
  document.querySelector('#game').style.display = "block";
  document.querySelector('#winner').style.display = "none";
  document.querySelector('#game').classList.remove('winner');

  initializeGame();
});

// Reset the game
document.querySelector('#controls button').addEventListener('click', function(event) {
  debug("click event handler on #controls button---")
  initializeGame();
});
