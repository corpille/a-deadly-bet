import GameState from './GameState';
import { playBadEndingAnimation, repositionAllElements } from './animation';
import Audio from './audio';

const goodEnd = getElementById('goodEnd');
const badEnd = getElementById('badEnd');

export function getElementById(id: string): HTMLElement {
  return document.getElementById(id) as HTMLElement;
}

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
      try {
        // use to skip an async/await function
        await playCancelablePromise(playBadEndingAnimation, state);
      } catch {
        repositionAllElements(true);
      }
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
  end.style.left = '0';
  end.style.opacity = '1';
}
export function hideElement(end: HTMLElement): void {
  end.style.left = '100%';
  end.style.opacity = '0';
}

export function getRandomIndex(arr: Array<any>): number {
  return Math.floor(Math.random() * arr.length);
}

let canceled = false;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canceled) {
        canceled = false;
        reject();
      } else {
        resolve();
      }
    }, ms);
  });
}

export async function displayMessage(el: HTMLElement, msg: string) {
  for (let i = 0; i < msg.length; i++) {
    el.innerHTML += msg[i] === '\n' ? '<br/>' : msg[i];
    Audio.getInstance().playTS();
    if (canceled) {
      canceled = false;
      throw 1;
    }
    await sleep(35);
  }
}

export async function playCancelablePromise(animationFn: Function, state?: GameState): Promise<void> {
  const hookKeyboard = (event: KeyboardEvent) => {
    if (event.code == 'Space') {
      canceled = true;
      document.removeEventListener('keydown', hookKeyboard);
    }
  };
  const hookTactile = (event: TouchEvent) => {
    canceled = true;
    document.removeEventListener('touchstart', hookTactile);
  };
  document.addEventListener('keydown', hookKeyboard);
  document.addEventListener('touchstart', hookTactile);
  await animationFn(state);
}
