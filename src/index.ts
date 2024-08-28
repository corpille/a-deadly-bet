import { waitFor, playCancelablePromise, getElementById, hideElement } from './utils';
import { checkEndGame, popupEl, buttonEl } from './endGame';
import GameState, { ActionState } from './GameState';
import Audio, { chords, melody } from './audio';
import { playIntroAnimation, repositionAllElements } from './animation';

let state: GameState;


const game = getElementById('game');
const mute = getElementById('mute');
const isMute = localStorage.getItem('adb-mute') === 'off';
mute.classList.toggle('off', isMute);


window.addEventListener('resize', () => {
  if (state && state.ready) {
    state.refreshAll();
  }
});
mute.addEventListener('click', async (event: MouseEvent) => {
  const off = mute.classList.toggle('off');
  localStorage.setItem('adb-mute', off ? 'off' : 'on');
  Audio.getInstance().updateVolume();
});
buttonEl.addEventListener('click', () => state ? play() : start());
getElementById('play-malediction').addEventListener('click', () => state.playMalediction());

async function start() {
  hideElement(popupEl);
  Audio.getInstance().initAudioContext();
  mute.style.display = 'block';
  try {
    // use to skip an async/await function
    await playCancelablePromise(playIntroAnimation);
  } catch {
    repositionAllElements();
  }
  if (Object.keys(Audio.getInstance().intervals).length === 0) {
    Audio.getInstance().playBgMusic(chords);
    Audio.getInstance().playBgMusic(melody);
  }
  game.style.display = 'block';
  play();
}

async function play(): Promise<any> {
  // init game
  state = new GameState();
  hideElement(popupEl);
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
