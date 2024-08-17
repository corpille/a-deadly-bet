import { waitFor, resetEndState, checkEndGame } from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState;

(document.getElementById('play') as HTMLElement).addEventListener('click', () => {
  (document.getElementById('menu') as HTMLElement).style.display = 'none';
  (document.getElementById('game') as HTMLElement).style.display = 'block';
  start();
});
(document.getElementById('replay') as HTMLElement).addEventListener('click', start);
(document.getElementById('play-malediction') as HTMLElement).addEventListener('click', () => state.playMalediction());

function reset(): void {
  state = new GameState();
  resetEndState();
}

async function start(): Promise<any> {
  // init game
  reset();
  // Decision discard
  state.setActionState(ActionState.discard, 3);
  await waitFor(() => state.nbCardToAction === 0);
  state.setActionState(ActionState.draw);

  // Loop
  while (!(await checkEndGame(state))) {
    await waitFor(() => state.action === ActionState.draw && state.nbCardToAction === 0);
    state.setActionState(ActionState.draw);
    state.refresh();
  }
}
