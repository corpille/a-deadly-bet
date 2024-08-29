import { waitFor, playCancelablePromise, getElementById, hideElement, resetCancel, sleep } from './utils';
import { checkEndGame, popupEl, buttonEl, end } from './endGame';
import GameState, { ActionState } from './GameState';
import Audio, { chords, melody } from './audio';
import { playIntroAnimation, repositionAllElements } from './animation';
import { INITIAL_DRAW } from './config';

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
  buttonEl.blur();
  hideElement(popupEl);
  Audio.getInstance().initAudioContext();
  mute.style.display = 'block';
  try {
    // use to skip an async/await function
    await playCancelablePromise(playIntroAnimation);
  } catch {
    repositionAllElements();
  }
  resetCancel();
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
  // First discard
  state.setActionState(ActionState.discard, INITIAL_DRAW - 2);
  await waitFor(() => state.nbCardToAction === 0);
  state.setActionState(ActionState.draw);

  const gameloop = async () => {
    const res = await checkEndGame(state);
    if (!res) {
      setTimeout(() => {
        gameloop();
      }, 100);
    } else {
      end(state, res === 1);
    }
  }
  gameloop();
}
