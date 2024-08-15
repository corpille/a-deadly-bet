import GameState from './GameState';

export class BaseCard {
  type: string;
  hidden: boolean = false;
  canBeDiscarded: boolean = true;
}

export class TreasureCard extends BaseCard {
  val: number;

  constructor(val: number) {
    super();
    this.val = val;
    this.type = 't';
  }
}

export class MaledictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;

  constructor(name: string, desc: string, effect: string) {
    super();
    this.name = name;
    this.desc = desc;
    this.effect = effect;
    this.type = 'm';
  }
}

export class BenedictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;
  playable: boolean;

  constructor(name: string, desc: string, effect: string, playable: boolean = true) {
    super();
    this.name = name;
    this.desc = desc;
    this.effect = effect;
    this.playable = playable;
    this.type = 'b';
  }
}

export type Card = TreasureCard | MaledictionCard | BenedictionCard;

function createDomCard(card: Card): HTMLElement {
  const cardEl = document.createElement('div') as HTMLElement;
  cardEl.classList.add('card');
  if (card.hidden) {
    cardEl.classList.add('hidden');
  }
  if (!card.canBeDiscarded) {
    cardEl.classList.add('locked');
  }
  const cardInnerEl = document.createElement('div') as HTMLElement;
  cardInnerEl.classList.add('inner');
  const cardBackEl = document.createElement('div') as HTMLElement;
  cardBackEl.classList.add('back');
  const cardFrontEl = document.createElement('div') as HTMLElement;
  cardFrontEl.classList.add('front', card.type);

  const label = document.createElement('label') as HTMLElement;
  label.innerText = card instanceof TreasureCard ? 'Treasure' : card.name;

  const desc = document.createElement('p') as HTMLElement;
  desc.innerText = card instanceof TreasureCard ? card.val.toString() : card.desc;

  cardFrontEl.append(label);
  cardFrontEl.append(desc);
  cardInnerEl.append(cardFrontEl);
  cardInnerEl.append(cardBackEl);
  cardEl.append(cardInnerEl);
  return cardEl;
}

export function displayCards(el: any, cards: Array<Card>, onClickAction?: any): void {
  el.innerHTML = '';
  cards.forEach((card: Card) => {
    const cardEl = createDomCard(card);

    if (onClickAction) {
      cardEl.addEventListener('click', onClickAction);
    }
    el.appendChild(cardEl);
  });
}

export function pickCard(state: GameState, type?: string): Card | undefined {
  if (type) {
    return state.cards.findLast((c) => c.type === type);
  }
  return state.cards.pop();
}

export function pickCards(state: GameState, nb: number, type?: string): Array<Card> {
  // // Cheat
  // if (nb === 5) {
  //   const i = state.cards.findIndex((c) => c instanceof BenedictionCard && c.effect === 'lucky-switch');
  //   console.log(i);
  //   if (i !== -1) {
  //     return [...state.cards.splice(i, 1), ...[...Array(nb).keys()].map(() => state.cards.pop() as Card)];
  //   }
  // }
  return [...Array(nb).keys()].map(() => pickCard(state, type) as Card);
}
