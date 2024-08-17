import GameState from './GameState';

const goodEnd = document.getElementById('goodEnd') as HTMLElement;
const badEnd = document.getElementById('badEnd') as HTMLElement;

export function resetEndState(): void {
  hideElement(goodEnd);
  hideElement(badEnd);
}

export function shuffleArray(arr: Array<any>): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

export async function checkEndGame(state: GameState): Promise<boolean> {
  if (state.getSum() >= 13) {
    await state.activateLastChance();
    if (state.getSum() >= 13) {
      displayElement(badEnd);
      return true;
    }
  } else if (state.pile.length === 0) {
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

export function getRandomIndex(arr: Array<any>): number {
  return Math.floor(Math.random() * arr.length);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve, ms);
  });
}
