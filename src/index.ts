import { waitFor, resetEndState, checkEndGame } from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState;

(document.getElementById('replay') as HTMLElement).addEventListener('click', start);
(document.getElementById('play-malediction') as HTMLElement).addEventListener('click', () => {
  // if (state.currentBenediction?.effect === 'second-breath') {
  //   return;
  // }
  state.playMalediction();
});

function reset(): void {
  state = new GameState();
  resetEndState();
}

async function start(): Promise<any> {
  // init
  reset();
  // First draw
  state.setActionState(ActionState.discard, 3);
  await waitFor(() => state.nbCardToAction === 0);
  state.setActionState(ActionState.draw);

  // Loop
  while (!checkEndGame(state)) {
    await waitFor(() => state.action === ActionState.draw && state.nbCardToAction === 0);
    // if (state.activeMaledictions.find((c) => c.effect === 'quicksand')) {
    //   state.setActionState(ActionState.discard);
    //   await waitFor(() => state.nbCardToAction === 0);
    // }
    state.setActionState(ActionState.draw);
    state.refresh();
  }
}

start();
