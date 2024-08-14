import GameState from './GameState';

export class TreasureCard {
  type: string = 't';
  val: number;

  constructor(val: number) {
    this.val = val;
  }
}

export class MaledictionCard {
  type: string = 'm';
  name: string;
  desc: string;
  effect: string;

  constructor(name: string, desc: string, effect: string) {
    this.name = name;
    this.desc = desc;
    this.effect = effect;
  }
}

export class BenedictionCard {
  type: string = 'b';
  name: string;
  desc: string;
  effect: string;
  playable: boolean;

  constructor(name: string, desc: string, effect: string, playable: boolean = true) {
    this.name = name;
    this.desc = desc;
    this.effect = effect;
    this.playable = playable;
  }
}

export type Card = TreasureCard | MaledictionCard | BenedictionCard;

export function displayCards(el: any, cards: Array<Card>, onClickAction?: any): void {
  el.innerHTML = '';
  cards.forEach((card: Card) => {
    const div = document.createElement('div') as HTMLElement;
    div.classList.add('card', card.type);

    if (onClickAction) {
      div.addEventListener('click', onClickAction);
    }

    const label = document.createElement('label') as HTMLElement;
    label.innerText = card instanceof TreasureCard ? 'Treasure' : card.name;

    const desc = document.createElement('p') as HTMLElement;
    desc.innerText = card instanceof TreasureCard ? card.val.toString() : card.desc;

    div.append(label);
    div.append(desc);

    el.appendChild(div);
  });
}

export function pickCards(state: GameState, nb: number): Array<Card> {
  // Cheat
  if (nb === 5) {
    const i = state.cards.findIndex((c) => c instanceof BenedictionCard && c.effect === 'lucky-switch');
    console.log(i);
    if (i !== -1) {
      return [...state.cards.splice(i, 1), ...[...Array(nb).keys()].map(() => state.cards.pop() as Card)];
    }
  }
  return [...Array(nb).keys()].map(() => state.cards.pop() as Card);
}
