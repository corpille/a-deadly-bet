import { maledictionCards, specialsCards } from './config';
import { pickCards } from './cards';
import { waitFor, shuffleCards, resetEndState, checkEndGame } from './utils';
import GameState from './GameState';

let state: GameState = new GameState();

const instruction = document.getElementById('instruction') as HTMLElement;
const pileEl = document.getElementById('pile') as HTMLElement;
pileEl.addEventListener('click', () => {
  if (state.action === 'pick') {
    state.pickedCard = pickCards(state, 1)[0];
  }
});
(document.getElementById('replay') as HTMLElement).addEventListener('click', start);

function reset(): void {
  state = new GameState();
  resetEndState();
}

function handlePickedCard(): void {
  if (!state.pickedCard) {
    return;
  }
  console.log(state.pickedCard);
  if (state.pickedCard.type !== 'm') {
    state.hand.push(state.pickedCard);
    state.pickedCard = undefined;
  } else {
    console.log('malediction');
  }
  state.refresh();
  state.pickedCard = undefined;
}

async function start(): Promise<any> {
  reset();
  state.hand.push(...pickCards(state, 5));
  state.cards.push(...maledictionCards);
  shuffleCards(state.cards);
  state.refresh();
  instruction.innerText = 'Discard 3 cards';
  state.action = 'discard';
  await waitFor(() => state.hand.length === 2);

  while (!checkEndGame(state)) {
    instruction.innerText = 'Play or pick a card';
    state.action = 'pick';
    await waitFor(() => state.pickedCard);
    handlePickedCard();
  }
}

start();
