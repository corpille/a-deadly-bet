import { Card, TreasureCard } from './cards';
import GameState from './GameState';

const goodEnd = document.getElementById('goodEnd') as HTMLElement;
const badEnd = document.getElementById('badEnd') as HTMLElement;

export function resetEndState(): void {
  hideElement(goodEnd);
  hideElement(badEnd);
}

export function shuffleCards(cards: Array<Card>): void {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = cards[i];
    cards[i] = cards[j];
    cards[j] = temp;
  }
}

export function checkEndGame(state: GameState): boolean {
  if (state.getSum() >= 13) {
    state.checkSpecials();
    console.log(state.getSum());
    if (state.getSum() >= 13) {
      displayElement(badEnd);
      return true;
    }
  } else if (state.cards.length === 0) {
    displayElement(goodEnd);
    return true;
  }
  return false;
}

export async function waitFor(condFn: Function): Promise<any> {
  return new Promise((resolve) => {
    const check = (): void => {
      if (condFn()) {
        resolve(1);
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function displayElement(end: HTMLElement): void {
  end.style.left = '0px';
  end.style.opacity = '1';
}
export function hideElement(end: HTMLElement): void {
  end.style.left = '100%';
  end.style.opacity = '0';
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function getRandomIndex(arr: Array<any>): number {
  return Math.floor(Math.random() * arr.length);
}
