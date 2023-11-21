// script.js
const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];

const playerHandElement = document.getElementById('player-hand');
const dealerHandElement = document.getElementById('dealer-hand');
const dealButton = document.getElementById('deal-button');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const cardContainer = document.querySelector('.card'); // 追加


dealButton.addEventListener('click', deal);
hitButton.addEventListener('click', hit);
standButton.addEventListener('click', stand);

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function backgroundSound() {
  const backgroundSound = new Howl({
    src: ['sounds/background-sound.mp3'],
    loop: true,
    volume: 0.2,
  });
  backgroundSound.play();
}

  // Howler.jsを使用して効果音を再生
  const soundDealerWins = new Howl({
    src: ['sounds/dealer-wins-sound.mp3'], // 実際の音声ファイルのパスに変更
    volume: 0.5,
  });

  // Howler.jsを使用して効果音を再生
  const soundPlayerWins = new Howl({
    src: ['sounds/player-wins-sound.mp3'], // 実際の音声ファイルのパスに変更
    volume: 0.5,
  });

function startGame(){
  backgroundSound.play();
  // これより下の処理はベット機能などを追加する。
  const playerFirstCard = deck.pop();
  const dealerFirstCard = deck.pop();
  const playerSecondCard = deck.pop();
  const dealerSecondCard = deck.pop();

  // プレイヤーとディーラーの手札を初期化
  playerHand = [playerFirstCard, playerSecondCard];
  dealerHand = [dealerFirstCard, dealerSecondCard];

  renderHands();
  toggleButtons(true);
}


function stand() {
  while (calculateHandValue(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  renderHands();
  endGame(calculateWinner()); // ここで calculateWinner を呼び出す
}


function deal() {
  deck = createDeck();
  shuffleDeck(deck);

  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];

  renderHands();
  toggleButtons(true);
}

function hit() {
  playerHand.push(deck.pop());
  renderHands();

  if (calculateHandValue(playerHand) > 21) {
    endGame(false);
  }
}

function calculateHandValue(hand, excludeFirstCard = false) {
  let sum = 0;
  let hasAce = false;

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i]

    if (i === 0 && excludeFirstCard) {
      continue; // 初期手札の一枚目は total に加算しない
    }

    if (card.value === 'A') {
      hasAce = true;
    }
    sum += cardValue(card.value);
  }

  if (hasAce && sum + 10 <= 21) {
    sum += 10;
  }

  return sum;
}

function calculateWinner() {
  const playerScore = calculateHandValue(playerHand);
  const dealerScore = calculateHandValue(dealerHand);

  if (playerScore > 21) {
    return false; // Dealer wins, player busted
  }

  if (dealerScore > 21) {
    return true; // Player wins, dealer busted
  }

  return playerScore > dealerScore; // Compare scores
}


function cardValue(value) {
  return (value === 'K' || value === 'Q' || value === 'J') ? 10 : parseInt(value) || 11;
}

function renderHands() {
  renderHand(playerHand, playerHandElement);
  renderHand(dealerHand, dealerHandElement, true);

  const dealerTotalElement = dealerHandElement.querySelector('.hand-total');
  // ディーラーの初期手札は total に反映させない
  const initialDealerTotal = (dealerHand.length === 2 && calculateHandValue(dealerHand, true) !== calculateHandValue(dealerHand))
    ? calculateHandValue([dealerHand[1]]) // 初期カードの一枚目だけを計算に加える
    : calculateHandValue(dealerHand);

  dealerTotalElement.textContent = (dealerHand.length === 2) ? `Total: ${initialDealerTotal} + ?` : `Total: ${initialDealerTotal}`;
}

function revealDealerFirstCard() {
  // ディーラーの初期の裏側のカードを表示する
  const dealerHandElement = document.getElementById('dealer-hand');
  const firstCardElement = dealerHandElement.querySelector('.card img:first-child');
  firstCardElement.src = `images/${dealerHand[0].suit}/${dealerHand[0].value}.png`;

  const dealerTotalElement = dealerHandElement.querySelector('.hand-total');
  const initialDealerTotal = calculateHandValue([dealerHand[1]]);
  dealerTotalElement.textContent = `Total: ${initialDealerTotal + cardValue(dealerHand[0].value)}`;
}

function displayTotal() {
  const playerTotalElement = document.getElementById('player-area').querySelector('.hand-total');
  const dealerTotalElement = document.getElementById('dealer-area').querySelector('.hand-total');

  const playerTotal = calculateHandValue(playerHand);
  const dealerTotal = calculateHandValue(dealerHand);

  playerTotalElement.textContent = `Total: ${playerTotal}`;
  dealerTotalElement.textContent = `Total: ${dealerTotal}`;
}

function renderHand(hand, element, hideFirstCard) {
  element.innerHTML = '';

  for (let i = 0; i < hand.length; i++) {
    const card = hand[i];
    const cardElement = document.createElement('div');
    cardElement.className = 'card';

    if (i === 0 && hideFirstCard) {
      cardElement.innerHTML = `<img src="images/back.png" alt="Card Back">`;
    } else {
      cardElement.innerHTML = `<img src="images/${card.suit}/${card.value}.png" alt="${card.value} of ${card.suit}">`;
    }

    element.appendChild(cardElement);
  }

  const handValueElement = document.createElement('div');
  handValueElement.className = 'hand-total';
  // ディーラーの初期手札は total に反映させない
  handValueElement.textContent = (hideFirstCard) ? 'Total: ?' : `Total: ${calculateHandValue(hand)}`;
  element.appendChild(handValueElement);
}

function toggleButtons(enable) {
  hitButton.disabled = !enable;
  standButton.disabled = !enable;
}

function endGame(playerWins) {
  toggleButtons(false);

  if (playerWins) {
  revealDealerFirstCard();
  alert('Player wins!');
  soundPlayerWins.play();
  displayTotal();
  } else {
  revealDealerFirstCard();
  alert('Dealer wins!');
  soundDealerWins.play();
  displayTotal();
}}
// ゲーム開始時にボタンを無効化
toggleButtons(false);

