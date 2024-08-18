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
  activeBenediction: () => ({ top: 16, left: maxWidth - (cardWidth + 16) }),
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

export function getMaledictionCards(): MaledictionCard[] {
  return [
    new MaledictionCard('Past Weight', 'Add a hidden treasure from the pile to your hand', 'past-weight'),
    new MaledictionCard('Growing shadow', 'Add 2 points to one of the treasure card in your hand', 'growing-shadow'),
    new MaledictionCard('Unavoidable pain', "Pick a treasure card that can't be discarded", 'unavoidable-pain'),
    new MaledictionCard('Rage of the 13th', 'Add 1 to every card of value 3', '13th-rage'),
    new MaledictionCard('False Hope', 'Replace a random card in your hand with one on top of the pile', 'false-hope'),
    // new MaledictionCard('Faith of the gods', 'pick two random card in the pile, the sum must not be 13', 'god-faith'),
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
  { name: 'Evasion', desc: 'Discard a card in your hand', effect: 'evasion' },
  {
    name: 'Protection',
    desc: 'Lower a choosen card by 2. If it reaches 0, the card is discarded',
    effect: 'protection',
  },
  { name: 'Lucky switch', desc: 'Switch one card from you hand by one of the same type', effect: 'lucky-switch' },
  // {
  //   name: 'Vision of the future',
  //   desc: 'Reveal the first 3 card on the pile choose 1 and discard 2',
  //   effect: 'future-vision',
  // },
  {
    name: 'Revelation',
    desc: 'Reveal a hidden card and lower its value by 2. If it reaches 0, the card is discarded',
    effect: 'revelation',
  },
  { name: '13th taslisman', desc: 'Shield you from loosing but remove all of your cards', effect: '13th-talisman' },
  { name: 'Second breath', desc: 'Cancels the next malediction card', effect: 'second-breath' },
];

export function getRandomBenediction(benedictionHand: string[], cardByid: { [id: string]: Card }): BenedictionCard {
  let benediction = new BenedictionCard(benedictions[Math.floor(Math.random() * benedictions.length)]);
  while (
    benedictionHand.findIndex(
      (id) => id !== 'empty' && (cardByid[id] as BenedictionCard).effect === benediction.effect,
    ) !== -1
  ) {
    benediction = new BenedictionCard(benedictions[Math.floor(Math.random() * benedictions.length)]);
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
