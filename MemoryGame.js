//XYREL
const icons = ['fa-anchor','fa-bicycle','fa-diamond','fa-leaf','fa-bomb','fa-bolt','fa-paper-plane-o','fa-cube'];
let cards = [];

let globalTimer = null;
const timerDiv = document.querySelector('.timer');
const playAgainButton = document.querySelector('.play-again');
const starsDiv = document.querySelector('.score-panel .stars');
const movesDiv = document.querySelector('.moves');
const resetButton = document.querySelector('.restart')
const scorePanel = document.querySelector('.score-panel');
const deck = document.querySelector('.deck');
const deckList = document.querySelectorAll('.deck');
const fragment = document.createDocumentFragment();
let state = {};

const startTimer = () => {
  globalTimer = setInterval(function () {
    state.time = state.time + 1;
    state.time === 3600 ? state = {...state, time: 0, hours: state.hours + 1} : null
    let hours = state.hours < 10 ? `0${state.hours}`: hours;
    let minutes = parseInt(state.time / 60);
    let seconds = parseInt(state.time % 60);
    hours >= 1 ? hours = `${hours}:` : hours = ''
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;
    timerDiv.textContent =  `${hours}${minutes}:${seconds}`;
  }, 1000);
}


function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

const handleWinner = (time) => {
  document.querySelector('.final-moves').textContent = state.moves;
  document.querySelector('.final-stars').firstChild.innerHTML = starsDiv.innerHTML;
  document.querySelector('.final-time').textContent = time;
  document.querySelector('.game-panel').classList.toggle('hidden');
  document.querySelector('.winner-message').classList.toggle('hidden');
}


const updateStars = (num) => {
  let stars = '';
  const starsDiv = document.querySelector('.score-panel .stars');
  starsDiv.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const star = '<li><i class="fa fa-star"></i></li>';
    stars = stars + star
  }
  starsDiv.innerHTML = stars;
  state.stars = num;
}


const displayErrors = (err) => {
  closeErrors();
  const errorMessage = `
  <div class="error-message">
    ${err}
    <a class="close" aria-label="Close">
      <span aria-hidden="true">×</span>
    </button>
  </a>`;
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-div';
  errorDiv.innerHTML = errorMessage;
  scorePanel.parentNode.insertBefore(errorDiv, scorePanel.nextSibling);
  const closeButton = document.querySelector('.close');
  closeButton.addEventListener('click', closeErrors);
}


const closeErrors = () => {
  const errorDiv = document.querySelector('.error-div');
  errorDiv ? errorDiv.remove() : null;
}

const handleClick = (e,i) => {

  if (cards[i].isSolved === true) {
    displayErrors('You found this match already, try clicking a new card');
    return;
  }
  if (state.noClicks) {
    displayErrors('Be patient young grasshopper, you can only match two cards at once');
    return;
  }

  if (!state.isMatching) {
    flipCard(e,i);
  } else {

    if (state.firstIndex === i) {
      state.noClicks = false;
      displayErrors('You just clicked this card, try clicking a new card');
      return;
    } else {
      checkMatch(e,i);
    }
  }
  state.isMatching = !state.isMatching;
}


const flipCard = (e,i) => {
  cards[i].isMatching = true;
  e.target.className = 'card open show';
  setTimeout(function(){
		e.target.firstChild.classList.toggle('hidden')
	}, 250);
  state.firstCard = e;
  state.firstIndex = i;
}

const checkMatch = (e,i) => {
  state.noClicks = true;
  const icon = e.target.lastElementChild.classList[1];
  const solution = cards.filter(c => c.isMatching === true && c.isSolved === false);
  e.target.className = 'card open show';

  if ( solution[0].icon === icon) {
    handleMatch(e, i, true);
  } else {
    handleMatch(e, i, false);
  }
}

const handleMatch = (e,i,match) => {
  if (!match) {

    e.target.className = 'card bad';
    state.firstCard.target.className = 'card bad';
    setTimeout(function(){
        e.target.firstChild.classList.toggle('hidden');
	  }, 250)
    setTimeout(function(){
      e.target.className = 'card close';
      state.firstCard.target.className = 'card close';
      e.target.firstChild.classList.toggle('hidden');
      state.firstCard.target.firstChild.classList.toggle('hidden');
    }, 1000);
  } else {
    e.target.className = 'card match';
    state.firstCard.target.className = 'card match';
    setTimeout(function(){
        e.target.firstChild.classList.toggle('hidden');
	  }, 250)
    cards[i].isSolved = true;
    cards[state.firstIndex].isSolved = true;
    state.solutions++;
  }
  setTimeout(function(){
    cards[state.firstIndex].isMatching = false;
    state.moves++;
    movesDiv.textContent = state.moves;
    state.moves === 21 ? updateStars(1) : state.moves === 11 ? updateStars(2) : null;

    if (state.solutions === 8) {
      window.clearInterval(globalTimer);
      handleWinner(timerDiv.textContent);
    }

    state.noClicks = false;
  }, 1000)
}


const startGame = () => {

  cards = [];
  for (let x = 0; x <= 1; x++) {
   icons.forEach(c => {
     cards.push({
       icon: c,
       isMatching: false,
       isSolved: false
     })
   })
  }

  state = {
    isMatching: false,
    firstCard: {},
    firstIndex: null,
    noClicks: false,
    solutions: 0,
    moves: 0,
    stars: 3,
    time: 0,
    hours: 0
  }

  movesDiv.textContent = state.moves;
  updateStars(3);
	closeErrors();

  shuffle(cards);

  cards.forEach((c,i) => {
    const card = document.createElement('li');
    card.className = 'card match';
    card.innerHTML = `<i class='fa ${c.icon}'></i>`;
    card.addEventListener('click', (e) => {
      handleClick(e,i);
    });
    fragment.appendChild(card);
  })

  deck.appendChild(fragment);


  setTimeout(function() {
    for (let i = 0; i <= 15; i++) {
      deckList[0].childNodes[i].className = 'card close';
      deckList[0].childNodes[i].firstChild.classList.toggle('hidden');
    }
    window.clearInterval(globalTimer);
    startTimer();
  }, 1500)

}

document.addEventListener("DOMContentLoaded", function(event) {
  startGame();

  resetButton.addEventListener('click', () => {
    timerDiv.textContent = '00:00';
    window.clearInterval(globalTimer);
    deck.innerHTML = '';
    closeErrors();
    startGame();
  })

  playAgainButton.addEventListener('click', function() {
    deck.innerHTML = '';
    document.querySelector('.game-panel').classList.toggle('hidden');
    document.querySelector('.winner-message').classList.toggle('hidden');
    startGame();
  })
});

function myFunction() {
    var x = document.getElementById("Xyrel");
    if (x.style.display == "block") { 
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }