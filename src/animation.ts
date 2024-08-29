import { sleep, playDialog, getRandomIndex, getElementById } from './utils';
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
    ['You died', 1000],
    ['.', 300],
    ['.', 300],
    ['.', 1000],
    [` ${randomDeath}`, 2000],
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
    ['Oh crap!\n', 300],
    ['No! ', 200],
    ['No! ', 200],
    ['No!\n', 200],
    ['I got so much stuff to do!', 2000],
  ]);

  await playDialog(ghostLabel, [
    ["I had Bob's barbecue at 1pm...\n", 1000],
    ["And the Laker's finals on the 13th...\n", 1000],
    ["I can't die now!", 1000],
  ]);
  deathEl.style.right = `25%`;
  await sleep(1000);

  setDeathLabelPosition();
  await playDialog(deathLabel, [
    ['Welp! What do we have here?\n', 600],
    ["Another stupid death I'm guessing?\n", 600],
    ['What is it this time?\n', 1500],
  ]);

  await playDialog(ghostLabel, [[`I died ${randomDeath}...`, 1500]]);
  await playDialog(deathLabel, [
    ['*chuckles*\n', 500],
    ['I see...\n', 1500],
    ["Well, let's go! I got things to do!", 1500],
  ]);
  deathEl.style.animationName = 'flippedFloat';
  deathEl.style.right = `5%`;
  await sleep(500);

  await playDialog(ghostLabel, [['Ghost: Wait!\n', 1000]]);
  deathEl.style.animationName = 'float';
  await sleep(200);
  deathEl.style.right = `25%`;
  await sleep(500);

  await playDialog(ghostLabel, [
    ["I got to go back! I can't die now.\n", 1000],
    ['I got important things to do!', 1500],
  ]);
  await playDialog(deathLabel, [["That's not how it works buddy, you don't get to choose.\n", 1000]]);
  await playDialog(ghostLabel, [["Can't you give me another chance ?\n", 2000]]);
  await playDialog(deathLabel, [
    ['.', 300],
    ['.', 300],
    ['.', 1500],
  ]);
  await playDialog(deathLabel, [
    [" Ok, let's try something !\n", 1000],
    ["If you can win a game of my chosing I'll give you some more time.\n", 1000],
    ['Deal ?\n', 1000],
  ]);
  await playDialog(ghostLabel, [['Absolutely! Deal!', 1500]]);
  await playDialog(deathLabel, [["*smirks* Let's go then !", 1500]]);
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
  deathEl.style.transition = 'none';
  deathEl.style.bottom = 'calc(100vh - 23rem - 2rem)';
  deathEl.style.animation = 'float 4s 0.1s infinite';
  ghostLabel.classList.remove('br');
  ghostLabel.classList.add('rt');
  ghostLabel.style.right = '30rem';
  ghostLabel.style.top = '6rem';
  ghostLabel.style.bottom = 'auto';
  ghostLabel.style.left = 'auto';
  await playDialog(ghostLabel, [
    ["Alright! Here's the game!\n", 1000],
    ['You see that pile over there!\n', 1000],
  ]);
}

export async function playPilePresentation() {
  await playDialog(ghostLabel, [
    ["It's filled with cards up to 7, and you're going to empty it.\n", 2000],
  ]);
  await playDialog(ghostLabel, [
    ['But without your hand total ever reaching 13 or above.\n', 1000],
    ['Seems fair right ?', 2000],
  ]);
}

export async function playHandPresentation() {
  await playDialog(ghostLabel, [
    ['Oh did I mention I added some specials malediction cards in here to spice things up ?\n', 2000],
  ]);
  await playDialog(ghostLabel, [
    ['What ?\n', 1000],
    ["It's undoable ?\n", 1000],
    ['Alright! Here!', 1500],
  ]);
}

export async function playBenedictionHandPresentation() {
  await playDialog(ghostLabel, [
    ["I'll give you unlimited use of these benediction cards.\n", 1000],
    ["I'm really feeling generous today!\n", 1000],
    ["Well let's see how you do!", 2000],
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

async function initStop(state: GameState) {
  state.ready = false;
  getElementById('instruction').style.opacity = '0';
  getElementById('card-remaining').style.opacity = '0';
  getElementById('credits').style.opacity = '0';
  await sleep(800);
  ghostEl.style.transition = 'all .8s linear';
  deathEl.style.transition = 'all .8s linear';
  Object.keys(state.cardById).forEach((id) => {
    const cardEl = getElementById(id);
    cardEl.style.left = `-${cardWidth()}px`;
    cardEl.style.top = `-${cardHeight()}px`;
  });
}

async function initEndScene() {
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
}

export async function playBadEndingAnimation(state: GameState) {
  await initStop(state);
  await initEndScene();
  await playDialog(deathLabel, [
    ['Well ...\n', 1000],
    ["Looks like luck wasn't on your side this time.\n", 2000],
  ]);

  await playDialog(deathLabel, [
    ["he ", 500],
    ["he ", 500],
    ["he ", 500],
    ["he ", 500],
    ["he\n", 500],
    ["*cough*\n", 500],
    ["Alright, let's go then !\n", 1000],
    ["We're going to find you a nice and cozy place in hell for you!\n", 2000],
  ]);

  await playDialog(ghostLabel, [
    ['Oh man really !\n', 1000],
    ['Well at least I tried!', 2000],
  ]);
  await leave();

  repositionAllElements(true);
}



export async function playGoodEndingAnimation(state: GameState) {
  await initStop(state);
  await initEndScene();
  await playDialog(ghostLabel, [
    ["Let's goooooo!!!!\n", 1000],
    ["Take that you stupid death!\n", 2500],
  ]);
  await playDialog(ghostLabel, [
    ["Ummmh ... Sorry.\n", 1000],
    ["I mean I won your game can I go back now?\n", 2500],
  ]);

  await playDialog(deathLabel, [
    ["*sight*\n", 1000],
    ["Fine, you get 13 more days to live after that I'll be back to reap you !\n", 2000],
  ]);

  await playDialog(ghostLabel, [
    ['Hell yeah !\n', 1500],
  ]);
  await playDialog(deathLabel, [
    ["Hurry up I don't have all day!\n", 2000],
  ]);
  await leave();

  repositionAllElements(true);
}
