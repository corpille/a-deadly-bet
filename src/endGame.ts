import { playBadEndingAnimation, playGoodEndingAnimation, repositionAllElements } from "./animation";
import GameState from "./GameState";
import { displayElement, getElementById, hideElement, playCancelablePromise, querySelector } from "./utils";

export const popupEl = getElementById('popup');
export const buttonEl = getElementById('button');
const titleEl = querySelector('#popup h1');
const subTitleEl = querySelector('#popup h3');

export async function checkEndGame(state: GameState): Promise<boolean> {
  if (state.getSum() >= 13) {
    await state.activateLastChance();
    if (state.getSum() >= 13) {
      await end(state, false);
      return true;
    }
  } else if (state.pile.length === 0) {
    await end(state, true);
    return true;
  }
  return false;
}

async function end(state: GameState, isGoodEnding: boolean) {
  try {
    // use to skip an async/await function
    await playCancelablePromise(isGoodEnding ? playGoodEndingAnimation : playBadEndingAnimation, state);
  } catch {
    repositionAllElements(true);
  }
  titleEl.innerText = isGoodEnding ? 'You get to live another day!' : 'You died!';
  subTitleEl.innerText = isGoodEnding ? 'For now...' : 'For real this time';
  buttonEl.innerText = isGoodEnding ? 'Play again' : 'Try again';
  displayElement(popupEl);
}