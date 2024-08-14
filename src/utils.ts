import { Card, TreasureCard } from './cards';
import GameState from './GameState';

export const treasureCards: Array<TreasureCard> = generateTreasureCards();

const goodEnd = document.getElementById('goodEnd') as HTMLElement;
const badEnd = document.getElementById('badEnd') as HTMLElement;

export function resetEndState(): void {
  goodEnd.style.left = '100%';
  badEnd.style.left = '100%';
  goodEnd.style.opacity = '0';
  badEnd.style.opacity = '0';
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
      endGame(badEnd);
      return true;
    }
  } else if (state.cards.length === 0) {
    endGame(goodEnd);
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

function endGame(end: HTMLElement): void {
  end.style.left = '0px';
  end.style.opacity = '1';
}

function generateTreasureCards(): Array<TreasureCard> {
  const availableCards: Array<TreasureCard> = [...Array(7).keys()].map((i) => new TreasureCard(i + 1));
  return [...availableCards, ...availableCards, ...availableCards, ...availableCards];
}
