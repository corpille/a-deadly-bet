import { sleep, displayMessage, getRandomIndex, getElementById } from './utils';
import Audio, { chords, loopLength, melody } from './audio';
import GameState from './GameState';
import { cardHeight, cardWidth } from './config';

const deathEl = getElementById('death');
const floorEl = getElementById('floor');
const ghostEl = getElementById('ghost');
export const skipEl = getElementById('skip');
export const ghostLabel = getElementById('label1');
export const deathLabel = getElementById('label2');

const deaths = [
  'while swallowing a watermelon',
  'opening a can of tuna',
  'falling from a bench',
  'getting hit by a turtoise shell',
  'while attempting to ride a snail',
  'trying to obtain the world record for the longest wedgy',
  'protesting helmet regulation',
  'falling into a giant bowl of jello',
  'crushed by a pile of my collectioned snow globes',
];

async function playDialog(el: HTMLElement, lines: { msg: string; time: number }[]) {
  el.innerHTML = '';
  el.style.opacity = '1';
  for (let i = 0; i < lines.length; i++) {
    await displayMessage(el, lines[i].msg);
    await sleep(lines[i].time);
  }
  el.style.opacity = '0';
  await sleep(300);
}

function setGhostLabelPosition() {
  ghostLabel.style.left = `${ghostEl.offsetLeft + ghostEl.clientWidth / 2 - ghostLabel.clientWidth / 2}px`;
  ghostLabel.style.bottom = '31.25rem';
  ghostLabel.classList.add('br');
}
function setDeathLabelPosition() {
  deathLabel.style.left = `${deathEl.offsetLeft + deathEl.clientWidth / 3 - deathLabel.clientWidth / 2}px`;
  deathLabel.style.bottom = '31.25rem';
  deathLabel.classList.add('bl');
}

export async function playIntroAnimation() {
  skipEl.style.opacity = '1';
  const randomDeath = deaths[getRandomIndex(deaths)];
  await playDialog(ghostLabel, [
    { msg: 'You died', time: 1000 },
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1000 },
    { msg: ` ${randomDeath}`, time: 2000 },
  ]);

  setGhostLabelPosition();

  ghostEl.style.bottom = `2rem`;
  await sleep(200);
  // Show floor
  floorEl.style.bottom = '0';

  Audio.getInstance().playBgMusic(chords);
  setTimeout(() => {
    Audio.getInstance().playBgMusic(melody);
  }, loopLength * chords.notes.length);
  await sleep(500);

  await playDialog(ghostLabel, [
    { msg: 'Oh crap!\n', time: 300 },
    { msg: 'No! ', time: 200 },
    { msg: 'No! ', time: 200 },
    { msg: 'No!\n', time: 200 },
    { msg: 'I got so much stuff to do!', time: 2000 },
  ]);

  await playDialog(ghostLabel, [
    { msg: "I had Bob's barbecue at 1pm...\n", time: 1000 },
    { msg: "And the Laker's finals on the 13th...\n", time: 1000 },
    { msg: "I can't die now!", time: 1000 },
  ]);
  deathEl.style.right = `25%`;
  await sleep(1000);

  setDeathLabelPosition();
  await playDialog(deathLabel, [
    { msg: 'Welp! What do we have here?\n', time: 600 },
    { msg: "Another stupid death I'm guessing?\n", time: 600 },
    { msg: 'What is it this time?\n', time: 1500 },
  ]);

  await playDialog(ghostLabel, [{ msg: `I died ${randomDeath}...`, time: 1500 }]);
  await playDialog(deathLabel, [
    { msg: '*chuckles*\n', time: 500 },
    { msg: 'I see...\n', time: 1500 },
    { msg: "Well, let's go! I got things to do!", time: 1500 },
  ]);
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `5%`;
  await sleep(500);

  await playDialog(ghostLabel, [{ msg: 'Ghost: Wait!\n', time: 1000 }]);
  deathEl.style.animationName = 'float';
  await sleep(200);
  deathEl.style.right = `25%`;
  await sleep(500);

  await playDialog(ghostLabel, [
    { msg: "I got to go back! I can't die now.\n", time: 1000 },
    { msg: 'I got important things to do!', time: 1500 },
  ]);
  await playDialog(deathLabel, [{ msg: "That's not how it works buddy, you don't get to choose.\n", time: 1000 }]);
  await playDialog(ghostLabel, [{ msg: "Can't you give me another chance ?\n", time: 2000 }]);
  await playDialog(deathLabel, [
    { msg: '.', time: 300 },
    { msg: '.', time: 300 },
    { msg: '.', time: 1500 },
  ]);
  await playDialog(deathLabel, [
    { msg: " Ok, let's try something !\n", time: 1000 },
    { msg: "If you can win a game of my chosing I'll give you some more time.\n", time: 1000 },
    { msg: 'Deal ?\n', time: 1000 },
  ]);
  await playDialog(ghostLabel, [{ msg: 'Absolutely! Deal!', time: 1500 }]);
  await playDialog(deathLabel, [{ msg: "*smirks* Let's go then !", time: 1500 }]);
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `-31.25rem`;
  ghostEl.style.transition = 'all 1.4s linear';
  ghostEl.style.left = '100%';
  await sleep(2000);
  leave();
  repositionAllElements();
}

async function leave() {
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `-31.25rem`;
  ghostEl.style.transition = 'all 1.4s linear';
  ghostEl.style.left = '100%';
  await sleep(2000);
}

export async function showDeath() {
  deathEl.style.display = 'block';
  deathEl.style.right = '12.5rem';
  deathEl.style.bottom = 'calc(100vh - 23rem - 2rem)';
}

export async function playTutorialBegining() {
  deathEl.style.display = 'block';
  deathEl.style.animation = 'incoming ease-in-out 2s forwards';
  await sleep(2300);
  deathEl.style.right = '12.5rem';
  deathEl.style.bottom = 'calc(100vh - 23rem - 2rem)';
  deathEl.style.animation = 'float 4s 0.1s infinite';
  ghostLabel.classList.remove('br');
  ghostLabel.classList.add('rt');
  ghostLabel.style.right = '30rem';
  ghostLabel.style.top = '6rem';
  ghostLabel.style.bottom = 'calc(100vh - 6rem)';
  ghostLabel.style.left = 'auto';
  await playDialog(ghostLabel, [
    { msg: "Alright! Here's the game!\n", time: 1000 },
    { msg: 'You see that pile over there!\n', time: 1000 },
  ]);
}

export async function playPilePresentation() {
  await playDialog(ghostLabel, [
    { msg: "It's filled with cards up to 7, and you're going to empty it.\n", time: 2000 },
  ]);
  await playDialog(ghostLabel, [
    { msg: 'But without your hand total ever reaching 13 or above.\n', time: 1000 },
    { msg: 'Seems fair right ?', time: 2000 },
  ]);
}

export async function playHandPresentation() {
  await playDialog(ghostLabel, [
    { msg: 'Oh did I mention I added some specials malediction cards in here to spice things up ?\n', time: 2000 },
  ]);
  await playDialog(ghostLabel, [
    { msg: 'What ?\n', time: 1000 },
    { msg: "It's undoable ?\n", time: 1000 },
    { msg: 'Alright! Here!', time: 1500 },
  ]);
}

export async function playBenedictionHandPresentation() {
  await playDialog(ghostLabel, [
    { msg: "I'll give you unlimited use of these benediction cards.\n", time: 1000 },
    { msg: "I'm really feeling generous today!\n", time: 1000 },
    { msg: "Well let's see how you do!", time: 2000 },
  ]);
}

export function repositionAllElements(complete: boolean = false) {
  skipEl.style.opacity = '0';
  floorEl.style.opacity = '0';
  floorEl.style.bottom = '-3rem';
  ghostLabel.style.opacity = '0';
  ghostEl.style.transition = 'none';
  ghostEl.style.opacity = '0';
  ghostEl.style.bottom = '2rem';
  ghostEl.style.left = '-2rem';
  if (complete) {
    deathLabel.style.opacity = '0';
    deathEl.style.transition = 'none';
    deathEl.style.right = 'calc(-20rem * var(--scytheRatio))';
    deathEl.style.bottom = '2rem';
  }
}

export async function playBadEndingAnimation(state: GameState) {
  state.ready = false;
  await sleep(800);
  ghostEl.style.transition = 'all .8s linear';
  deathEl.style.transition = 'all .8s linear';
  Object.keys(state.cardById).forEach((id) => {
    const cardEl = getElementById(id);
    cardEl.style.left = `-${cardWidth()}px`;
    cardEl.style.top = `-${cardHeight()}px`;
  });
  skipEl.style.opacity = '1';
  floorEl.style.opacity = '1';
  floorEl.style.bottom = '0';
  await sleep(300);

  ghostEl.style.opacity = '1';
  deathEl.style.bottom = `2rem`;
  deathEl.style.right = `25%`;
  ghostEl.style.left = `calc(32% - (13rem / 2) - 1rem)`;
  await sleep(800);
  setDeathLabelPosition();
  setGhostLabelPosition();

  await playDialog(deathLabel, [
    { msg: 'Well ...\n', time: 1000 },
    { msg: "Looks like luck wasn't on your side today.\n", time: 2000 },
  ]);

  await playDialog(deathLabel, [
    { msg: "Alright, let's go then !\n", time: 1000 },
    { msg: "We're going to find a nice and cozy place in hell for you!", time: 2000 },
  ]);

  await playDialog(ghostLabel, [
    { msg: 'Oh man really !\n', time: 1000 },
    { msg: 'Well at least I tried!', time: 2000 },
  ]);
  await leave();

  repositionAllElements(true);
}
