import { waitFor, resetEndState, checkEndGame, playCancelablePromise, getElementById } from './utils';
import GameState, { ActionState } from './GameState';
import Audio from './audio';
import { label1El, label2El, playIntroAnimation } from './animation';

let state: GameState;

window.addEventListener('resize', () => {
  if (state) {
    state.refreshAll();
  }
});

const menu = getElementById('menu');
const scene = getElementById('scene');
const game = getElementById('game');
const mute = getElementById('mute');
const isMute = localStorage.getItem('adb-mute') === 'off';
mute.classList.toggle('off', isMute);

mute.addEventListener('click', async (event: MouseEvent) => {
  const off = mute.classList.toggle('off');
  localStorage.setItem('adb-mute', off ? 'off' : 'on');
  Audio.getInstance().updateVolume();
});

getElementById('start-button').addEventListener('click', async () => {
  menu.style.display = 'none';
  scene.style.display = 'flex';
  Audio.getInstance().initAudioContext();
  try {
    // use to skip an async/await function
    await playCancelablePromise(playIntroAnimation);
  } catch {
    label1El.style.opacity = '0';
    label2El.style.opacity = '0';
  }
  scene.style.display = 'none';
  game.style.display = 'block';
  start();
});

getElementById('replay').addEventListener('click', start);
getElementById('play-malediction').addEventListener('click', () => state.playMalediction());

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
    state.refreshInterface();
  }
}
