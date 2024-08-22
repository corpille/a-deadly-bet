import {
  waitFor,
  resetEndState,
  checkEndGame,
  sleep,
  displayMessage,
  getRandomIndex,
  playCancelablePromise,
} from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState;

window.addEventListener('resize', () => {
  if (state) {
    state.refreshAll();
  }
});

(document.getElementById('play') as HTMLElement).addEventListener('click', () => {
  (document.getElementById('menu') as HTMLElement).style.display = 'none';
  (document.getElementById('game') as HTMLElement).style.display = 'block';
  start();
});
(document.getElementById('replay') as HTMLElement).addEventListener('click', start);
(document.getElementById('play-malediction') as HTMLElement).addEventListener('click', () => state.playMalediction());

(async () => {
  try {
    await playCancelablePromise(playBeginAnimation);
  } catch {}

  const scene = document.getElementById('scene') as HTMLElement;
  scene.style.display = 'none';

  const menu = document.getElementById('menu') as HTMLElement;
  menu.style.display = 'flex';
})();

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
  const floorEl = document.getElementById('floor') as HTMLElement;
  const ghostEl = document.getElementById('ghost') as HTMLElement;
  const deathEl = document.getElementById('death') as HTMLElement;
  const label1El = document.getElementById('label1') as HTMLElement;
  const label2El = document.getElementById('label2') as HTMLElement;
  await playDialog(label1El, [
    { msg: 'You died', time: 1000 },
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1000 },
    { msg: ` ${randomDeath}`, time: 2000 },
  ]);
  label1El.style.bottom = label2El.style.bottom = `31.25rem`;

  label1El.style.left = `${ghostEl.offsetLeft + ghostEl.clientWidth / 2 - label1El.clientWidth / 2}px`;

  ghostEl.style.bottom = `1rem`;
  await sleep(200);

  // Show floor
  floorEl.style.bottom = '0';
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
    { msg: "I can's die now!", time: 1000 },
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
    { msg: '*chuckles*', time: 500 },
    { msg: 'I see...\n', time: 1500 },
    { msg: "Well, let's go! I got things to do!", time: 1500 },
  ]);
  deathEl.style.transform = 'scaleX(-1)';
  deathEl.style.right = `5%`;
  await sleep(500);

  await playDialog(label1El, [{ msg: 'Ghost: Wait!\n', time: 1000 }]);
  deathEl.style.transform = '';
  await sleep(200);
  deathEl.style.right = `25%`;
  await sleep(500);

  await playDialog(label1El, [
    { msg: "I got to go back! I can't die now.\n", time: 1000 },
    { msg: 'I got important things to do!', time: 1500 },
  ]);
  await playDialog(label2El, [{ msg: "That's not how it works buddy, you don't get to choose.\n", time: 1000 }]);
  await playDialog(label1El, [{ msg: "Can't you give me another chance ?.\n", time: 2000 }]);
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
  deathEl.style.transform = 'scaleX(-1)';
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
