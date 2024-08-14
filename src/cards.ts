import GameState from './GameState';
import { waitFor } from './utils';

export interface Card {
  type: 't' | 's' | 'm';
  effect?: string;
  name?: string;
  desc?: string;
  val?: number | null;
}

export function displayCards(el: any, cards: Array<Card>, onClickAction?: any): void {
  el.innerHTML = '';
  cards.forEach((card: Card) => {
    const div = document.createElement('div') as HTMLElement;
    div.classList.add('card', card.type);

    if (onClickAction) {
      div.addEventListener('click', onClickAction);
    }

    const label = document.createElement('label') as HTMLElement;
    label.innerText = (card.type === 't' ? 'Treasure' : card.name) ?? '';

    const desc = document.createElement('p') as HTMLElement;
    desc.innerText = (card.type === 't' ? card.val : card.desc)?.toString() ?? '';

    div.append(label);
    div.append(desc);

    el.appendChild(div);
  });
}

export async function playCard(state: GameState, event: MouseEvent): Promise<void> {
  console.log(state, event);
  const i = Array.from(state.handEl.children).indexOf(event.currentTarget as HTMLElement);
  if (state.action === 'discard') {
    console.log('discard', i);
    state.discardCard(i);
  } else {
    const card = state.hand[i];
    if (card.type === 's') {
      await playSpecial(state, card);
      state.discardCard(i);
    }
  }
}

async function playSpecial(state: GameState, card: Card): Promise<void> {
  const handLenght = state.hand.length;
  switch (card.effect) {
    case 'evasion':
      state.action === 'dicard';
      await waitFor(() => state.hand.length === handLenght - 1);
  }
}

export function pickCards(state: GameState, nb: number): Array<Card> {
  return [...Array(nb).keys()].map(() => state.cards.pop() as Card);
}
