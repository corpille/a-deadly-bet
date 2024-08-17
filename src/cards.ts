let id = 0;

const maxHeight = window.innerHeight;
const maxWidth = window.innerWidth;
const cardHeight = 200;
const cardWidth = 130;

export const positions = {
  pile: () => ({ top: 16, left: 16 }),
  benedictionPile: () => ({ top: 16, left: 16 + (cardWidth + 16) }),
  discard: () => ({ top: 16, left: 16 + (cardWidth + 16) * 2 }),
  hand: (index: number) => ({ top: maxHeight - cardHeight - 16, left: 16 + (cardWidth + 16) * index }),
  benedictionHand: (index: number) => ({
    top: maxHeight - cardHeight - 16,
    left: maxWidth - (cardWidth + 16) * (3 - index),
  }),
  center: () => ({ top: maxHeight / 2 - cardHeight / 2, left: maxWidth / 2 - cardWidth / 2 }),
};

export class BaseCard {
  id: string;
  type: string;
  hidden: boolean = true;
  listener?: any;
  pos: { top: number; left: number } = positions.pile();
  canBeDiscarded: boolean = true;

  constructor(type: string) {
    this.type = type;
    this.id = `${this.type}-${id++}`;
  }
}

export class TreasureCard extends BaseCard {
  val: number;

  constructor(val: number) {
    super('t');
    this.val = val;
  }
}

export class MaledictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;

  constructor(name: string, desc: string, effect: string) {
    super('m');
    this.name = name;
    this.desc = desc;
    this.effect = effect;
  }
}

export class BenedictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;
  playable: boolean;

  constructor(options: { name: string; desc: string; effect: string }) {
    super('b');
    this.name = options.name;
    this.desc = options.desc;
    this.effect = options.effect;
  }
}

export type Card = TreasureCard | MaledictionCard | BenedictionCard;

export function createDomCard(card: Card, id: string): HTMLElement {
  const cardEl = document.createElement('div') as HTMLElement;
  cardEl.classList.add('card', card.type);
  if (!card.canBeDiscarded) {
    cardEl.classList.add('locked');
  }
  cardEl.setAttribute('data-id', id);
  const cardInnerEl = document.createElement('div') as HTMLElement;
  cardInnerEl.classList.add('inner');
  const cardBackEl = document.createElement('div') as HTMLElement;
  cardBackEl.classList.add('back');
  const cardFrontEl = document.createElement('div') as HTMLElement;
  cardFrontEl.classList.add('front');

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
