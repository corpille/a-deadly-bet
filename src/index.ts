import { waitFor, resetEndState, checkEndGame, sleep, displayMessage, getRandomIndex } from './utils';
import GameState, { ActionState } from './GameState';

let state: GameState;
window.addEventListener('resize', () => {
  state.refreshAll();
});

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
    state.refreshInterface();
  }
}

(async () => {
  if (localStorage.getItem('hasPlayedAnimation')) {
    await playBeginAnimation();
    localStorage.setItem('hasPlayedAnimation', 'true');
  }

  const scene = document.getElementById('scene') as HTMLElement;
  scene.style.display = 'none';

  const menu = document.getElementById('menu') as HTMLElement;
  menu.style.display = 'flex';
})();

async function playBeginAnimation() {
  const deaths = ['while swallowing a watermelon', 'opening a can of tuna', 'falling from a bench'];
  const randomDeath = deaths[getRandomIndex(deaths)];
  const floorEl = document.getElementById('floor') as HTMLElement;
  const ghostEl = document.getElementById('ghost') as HTMLElement;
  const deathEl = document.getElementById('death') as HTMLElement;
  const labelEl = document.getElementById('scene-label') as HTMLElement;
  await playDialog(labelEl, [
    { msg: 'You died', time: 1000 },
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1000 },
    { msg: ` ${randomDeath}`, time: 2000 },
  ]);

  ghostEl.style.bottom = `16px`;
  await sleep(200);

  // Show floor
  floorEl.style.bottom = '8px';
  await sleep(500);

  await playDialog(labelEl, [
    { msg: 'Oh crap! ', time: 300 },
    { msg: 'No! ', time: 500 },
    { msg: 'No! ', time: 500 },
    { msg: 'No! ', time: 500 },
    { msg: 'I got stuff to do!', time: 3000 },
  ]);

  await playDialog(labelEl, [
    { msg: "I had Bob's barbecue on Thursday...\n", time: 1000 },
    { msg: "I had the Knicker's finals in two week...\n", time: 1000 },
    { msg: 'Not now! ', time: 1000 },
  ]);
  deathEl.style.right = `32px`;
  await sleep(1000);
  await playDialog(labelEl, [
    { msg: 'Death: Welp! What do we have here?\n', time: 600 },
    { msg: "Another stupid death I'm guessing?\n", time: 600 },
    { msg: 'What is it this time?\n', time: 1500 },
    { msg: `Ghost: I died ${randomDeath}...`, time: 1500 },
  ]);
  await playDialog(labelEl, [
    { msg: 'Death: ', time: 1000 },
    { msg: ' *chuckles* I see...\n', time: 1500 },
    { msg: "Well, let's go! I got things to do!", time: 1500 },
  ]);
  deathEl.style.transform = 'scaleX(-1)';
  deathEl.style.right = `-64px`;
  await sleep(1000);
  deathEl.style.transform = '';

  await playDialog(labelEl, [
    { msg: 'Ghost: Wait!\n', time: 1000 },
    { msg: "I got to go back! I can't die now.\n", time: 1000 },
    { msg: 'I got important things to do!', time: 1500 },
  ]);
  await playDialog(labelEl, [
    { msg: "Death: That's not how it works buddy, you don't get to choose.\n", time: 1000 },
    { msg: "Ghost: Can't you give me another chance ?.\n", time: 1000 },
    { msg: 'Death: ', time: 1000 },
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1500 },
  ]);
  await playDialog(labelEl, [
    { msg: "Death: Ok, let's try something !\n", time: 1000 },
    { msg: "If you can win a game of my chosing i'll give you 13 more days.\n", time: 1000 },
    { msg: 'Deal ?\n', time: 1000 },
    { msg: 'Ghost: Absolutely!', time: 1500 },
  ]);
  await playDialog(labelEl, [{ msg: "Death: *smirks* Let's go then !", time: 1500 }]);
  deathEl.style.transform = 'scaleX(-1)';
  deathEl.style.right = `-500px`;
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
