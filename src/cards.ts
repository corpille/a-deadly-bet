import { cardHeight, cardWidth, maxHeight, maxWidth, NB_BENEDICTION_CARD } from './config';

let id = 0;

export const positions = {
  pile: () => ({ top: 16, left: 16 }),
  benedictionPile: () => ({ top: 16, left: 16 + (cardWidth + 16) }),
  discard: () => ({ top: 16, left: 16 + (cardWidth + 16) * 2 }),
  hand: (index: number) => ({ top: maxHeight() - cardHeight - 16, left: 16 + (cardWidth + 16) * index }),
  benedictionHand: (index: number) => ({
    top: maxHeight() - cardHeight - 16,
    left: maxWidth() - (cardWidth + 16) * (NB_BENEDICTION_CARD - index),
  }),
  center: () => ({ top: maxHeight() / 2 - cardHeight / 2, left: maxWidth() / 2 - cardWidth / 2 }),
  activeBenediction: () => ({ top: 16, left: maxWidth() - (cardWidth + 16) }),
};

export class BaseCard {
  id: string;
  type: string;
  hidden: boolean = true;
  listener?: any;
  posFn: any = positions.pile();
  pos: { top: number; left: number } = positions.pile();
  locked: boolean = false;
  val?: number;

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

  constructor(options: { name: string; desc: string; effect: string, val?: number }) {
    super('b');
    this.name = options.name;
    this.desc = options.desc;
    this.effect = options.effect;
    this.val = options.val;

  }
}

export type Card = TreasureCard | MaledictionCard | BenedictionCard;

export function createDomCard(card: Card, id: string): HTMLElement {
  const cardEl = document.createElement('div') as HTMLElement;
  cardEl.classList.add('card', card.type);
  if (!card.locked) {
    cardEl.classList.add('locked');
  }
  cardEl.setAttribute('data-id', id);
  cardEl.style.height = `${cardHeight}px`;
  cardEl.style.width = `${cardWidth}px`;
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

export function getMaledictionCards(): MaledictionCard[] {
  return [
    new MaledictionCard('Past Weight', 'Add a hidden treasure from the pile to your hand', 'past-weight'),
    new MaledictionCard('Growing shadow', 'Add 2 points to one of the treasure card in your hand', 'growing-shadow'),
    new MaledictionCard('Unavoidable pain', "Pick a treasure card that is locked", 'unavoidable-pain'),
    new MaledictionCard('Rage of the 13th', 'Add 1 to every card of value 3 in your hand', '13th-rage'),
    new MaledictionCard('False Hope', 'Replace a random card in your hand with one on top of the pile', 'false-hope'),
    new MaledictionCard(
      'Fracture of destiny',
      'Divide one treasure card by two, if 0 replace by one on the pile',
      'destiny-fracture',
    ),
    new MaledictionCard(
      'Echo of the past',
      'Pick a random discarded treasure card and add it to your hand',
      'past-echo',
    ),
  ];
}

const benedictions = [
  { name: 'Evasion', desc: 'Discard a card in your hand', effect: 'evasion', weight: 4 },
  {
    name: 'Protection I',
    desc: 'Lower a choosen card by 1. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 12,
    val: 1,
  }, {
    name: 'Protection II',
    desc: 'Lower a choosen card by 2. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 10,
    val: 2,
  }, {
    name: 'Protection III',
    desc: 'Lower a choosen card by 3. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 8,
    val: 3,
  },
  {
    name: 'Lucky switch',
    desc: 'Switch one card from you hand by one of the same type',
    effect: 'lucky-switch',
    weight: 6,
  },
  {
    name: 'Vision of the future',
    desc: 'Reveal the first 3 cards on the pile, choose 1 and discard 2',
    effect: 'future-vision',
    weight: 2,
  },
  {
    name: 'Revelation',
    desc: 'Reveal a hidden card and lower its value by 2. If it reaches 0, the card is discarded',
    effect: 'revelation',
    weight: 5,
  },
  {
    name: 'Second wind',
    desc: 'Shield you from loosing but remove all of your cards',
    effect: 'second-wind',
    weight: 1,
  },
  { name: '13th taslisman', desc: 'Cancel a malediction card', effect: '13th-talisman', weight: 4 },
];

const cumlativeWeight = benedictions.reduce((r: number[], benediction): any => {
  const v = (r.length ? r[r.length - 1] : 0) + benediction.weight;
  r.push(v);
  return r;
}, []);

function getWeightedRandom(): BenedictionCard {
  const val = Math.floor(Math.random() * cumlativeWeight[cumlativeWeight.length - 1]);
  const index = cumlativeWeight.findIndex((v) => v >= val);
  return new BenedictionCard(benedictions[index]);
}

export function getRandomBenediction(benedictionHand: string[], cardByid: { [id: string]: Card }): BenedictionCard {
  let benediction = getWeightedRandom();
  while (
    benedictionHand.findIndex(
      (id) => id !== 'empty' && (cardByid[id] as BenedictionCard).name === benediction.name,
    ) !== -1
  ) {
    benediction = getWeightedRandom();
  }
  return benediction;
}

export function getTreasureCards(): Array<TreasureCard> {
  const availableCards: Array<TreasureCard> = [];
  for (let i = 0; i < 4; i++) {
    // nb set
    for (let j = 0; j < 7; j++) {
      // max value
      availableCards.push(new TreasureCard(j + 1));
    }
  }
  return availableCards;
}
