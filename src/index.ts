import { getMaledictionCards } from './config';
import { Card, displayCards, MaledictionCard, pickCard, pickCards, TreasureCard } from './cards';
import { waitFor, shuffleCards, resetEndState, checkEndGame, displayElement, hideElement, sleep } from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState = new GameState();

const pileEl = document.getElementById('pile') as HTMLElement;
const maledictionEl = document.getElementById('malediction') as HTMLElement;
const maledictionCardEl = document.getElementById('malediction-card') as HTMLElement;

pileEl.addEventListener('click', () => {
  if (state.action === ActionState.draw) {
    const card = pickCard(state);
    if (card) {
      handlePickedCard(card);
    }
  }
});
(document.getElementById('replay') as HTMLElement).addEventListener('click', start);
(document.getElementById('play-malediction') as HTMLElement).addEventListener('click', () => {
  if (state.currentBenediction?.effect === 'second-breath') {
    return;
  }
  state.playMelediction();
  hideElement(maledictionEl);
  maledictionCardEl.innerHTML = '';
  state.hasDrawn = true;
});

function reset(): void {
  state = new GameState();
  resetEndState();
}

function handlePickedCard(card: Card): void {
  console.log('handlePickedCard', card instanceof MaledictionCard, card);
  if (!(card instanceof MaledictionCard)) {
    if (card instanceof TreasureCard && state.nextTreasureModifier) {
      state.nextTreasureModifier(card);
    }
    state.hand.push(card);
    state.hasDrawn = true;
  } else {
    state.currentMalediction = card;
    displayElement(maledictionEl);
    displayCards(maledictionCardEl, [card]);
    if (state.currentBenediction?.effect === 'second-breath') {
      sleep(1000); // animation second breath
      hideElement(maledictionEl);
      state.currentMalediction = undefined;
      state.currentBenediction = undefined;
    }
  }
  state.refresh();
}

async function start(): Promise<any> {
  // init
  reset();
  state.hand.push(...pickCards(state, 5));
  state.cards.push(...getMaledictionCards());
  shuffleCards(state.cards);

  // First draw
  state.setActionState(ActionState.discard);
  await waitFor(() => state.hand.length === 2);
  state.setActionState(ActionState.draw);

  while (!checkEndGame(state)) {
    await waitFor(() => state.hasDrawn);
    if (state.activeMaledictions.find((c) => c.effect === 'quicksand')) {
      state.setActionState(ActionState.discard);
      await waitFor(() => state.hasDiscarded);
    }
    state.hasDrawn = false;
    state.setActionState(ActionState.draw);
    console.log(state.hand);
  }
}

start();
