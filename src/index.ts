import { maledictionCards } from './config';
import { pickCards } from './cards';
import { waitFor, shuffleCards, resetEndState, checkEndGame } from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState = new GameState();

const pileEl = document.getElementById('pile') as HTMLElement;
pileEl.addEventListener('click', () => {
  if (state.action === ActionState.pick) {
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
  state.action = ActionState.discard;
  await waitFor(() => state.hand.length === 2);
  state.setActionState(ActionState.pick);

  while (!checkEndGame(state)) {
    await waitFor(() => state.pickedCard);
    handlePickedCard();
  }
}

start();
