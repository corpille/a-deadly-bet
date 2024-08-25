import {
  waitFor,
  resetEndState,
  checkEndGame,
  sleep,
  displayMessage,
  getRandomIndex,
  playCancelablePromise,
  getElementById
} from './utils';
import GameState, { ActionState } from './GameState';
import Audio, { chords, loopLength, melody } from './audio';

let state: GameState;

window.addEventListener('resize', () => {
  if (state) {
    state.refreshAll();
  }
});

const menu = getElementById('menu');
const scene = getElementById('scene');
const game = getElementById('game');
getElementById('button').addEventListener('click', async () => {
  menu.style.display = 'none';
  scene.style.display = 'flex';
  Audio.getInstance().initAudioContext();
  try {
    await playCancelablePromise(playBeginAnimation);
  } catch { }
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

async function playBeginAnimation() {

  const deaths = ['while swallowing a watermelon', 'opening a can of tuna', 'falling from a bench'];
  const randomDeath = deaths[getRandomIndex(deaths)];
  const floorEl = getElementById('floor');
  const ghostEl = getElementById('ghost');
  const deathEl = getElementById('death');
  const label1El = getElementById('label1');
  const label2El = getElementById('label2');
  await playDialog(label1El, [
    { msg: 'You died', time: 1000 },
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1000 },
    { msg: ` ${randomDeath}`, time: 2000 },
  ]);
  label1El.style.bottom = label2El.style.bottom = `31.25rem`;

  label1El.style.left = `${ghostEl.offsetLeft + ghostEl.clientWidth / 2 - label1El.clientWidth / 2}px`;

  ghostEl.style.bottom = `2rem`;
  await sleep(200);
  // Show floor
  floorEl.style.bottom = '0';

  Audio.getInstance().playBgMusic(chords);
  setTimeout(() => {
    Audio.getInstance().playBgMusic(melody);
  }, loopLength * chords.notes.length);
  await sleep(500);

  await playDialog(label1El, [
    { msg: 'Oh crap!\n', time: 300 },
    { msg: 'No! ', time: 200 },
    { msg: 'No! ', time: 200 },
    { msg: 'No!\n', time: 200 },
    { msg: 'I got so much stuff to do!', time: 2000 },
  ]);

  await playDialog(label1El, [
    { msg: "I had Bob's barbecue at 1pm...\n", time: 1000 },
    { msg: "I had the Laker's finals on the 13th...\n", time: 1000 },
    { msg: "I can't die now!", time: 1000 },
  ]);
  deathEl.style.right = `25%`;
  await sleep(1000);

  label2El.style.left = `${deathEl.offsetLeft + deathEl.clientWidth / 3 - label2El.clientWidth / 2}px`;
  await playDialog(label2El, [
    { msg: 'Welp! What do we have here?\n', time: 600 },
    { msg: "Another stupid death I'm guessing?\n", time: 600 },
    { msg: 'What is it this time?\n', time: 1500 },
  ]);

  await playDialog(label1El, [{ msg: `I died ${randomDeath}...`, time: 1500 }]);
  await playDialog(label2El, [
    { msg: '*chuckles*\n', time: 500 },
    { msg: 'I see...\n', time: 1500 },
    { msg: "Well, let's go! I got things to do!", time: 1500 },
  ]);
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `5%`;
  await sleep(500);

  await playDialog(label1El, [{ msg: 'Ghost: Wait!\n', time: 1000 }]);
  deathEl.style.animationName = 'float';
  await sleep(200);
  deathEl.style.right = `25%`;
  await sleep(500);

  await playDialog(label1El, [
    { msg: "I got to go back! I can't die now.\n", time: 1000 },
    { msg: 'I got important things to do!', time: 1500 },
  ]);
  await playDialog(label2El, [{ msg: "That's not how it works buddy, you don't get to choose.\n", time: 1000 }]);
  await playDialog(label1El, [{ msg: "Can't you give me another chance ?\n", time: 2000 }]);
  await playDialog(label2El, [
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1500 },
  ]);
  await playDialog(label2El, [
    { msg: " Ok, let's try something !\n", time: 1000 },
    { msg: "If you can win a game of my chosing i'll give you some more time.\n", time: 1000 },
    { msg: 'Deal ?\n', time: 1000 },
  ]);
  await playDialog(label1El, [{ msg: 'Absolutely! Deal!', time: 1500 }]);
  await playDialog(label2El, [{ msg: "*smirks* Let's go then !", time: 1500 }]);
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `-31.25rem`;
  ghostEl.style.transition = 'all 1.4s linear';
  ghostEl.style.left = '100%';
  await sleep(2000);
}

async function playDialog(el: HTMLElement, lines: { msg: string; time: number }[]) {
  el.style.opacity = '1';
  for (let i = 0; i < lines.length; i++) {
    await displayMessage(el, lines[i].msg);
    await sleep(lines[i].time);
  }
  el.style.opacity = '0';
  el.innerHTML = '';
  await sleep(300);
}
