export const maxHeight = () => window.innerHeight;
export const maxWidth = () => window.innerWidth;
export const cardHeight = 200;
export const cardWidth = 130;

export const DRAW_ANIMATION_MS = 200;
export const NB_BENEDICTION_CARD = 2;

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

export const maledictions = [
  { name: 'Past Weight', desc: 'Add a hidden treasure card to your hand', effect: 'past-weight' },
  { name: 'Growing shadow', desc: 'Add 2 points to one of your treasure card', effect: 'growing-shadow' },
  { name: 'Unavoidable pain', desc: 'Add a locked treasure card to your hand', effect: 'unavoidable-pain' },
  { name: 'Rage of the 13th', desc: 'Add 1 to every card of value 3', effect: '13th-rage' },
  { name: 'False Hope', desc: 'Replace a random card in your hand with one from the pile', effect: 'false-hope' },
  {
    name: 'Fracture of destiny',
    desc: 'Divide one treasure card by two, if 0 replace by one on the pile',
    effect: 'destiny-fracture',
  },
  {
    name: 'Echo of the past',
    desc: 'Pick a random discarded treasure card and add it to your hand',
    effect: 'past-echo',
  },
];

export const benedictions = [
  { name: 'Evasion', desc: 'Discard a card in your hand', effect: 'evasion', weight: 4 },
  {
    name: 'Protection I',
    desc: 'Lower a choosen card by 1. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 12,
    val: 1,
  },
  {
    name: 'Protection II',
    desc: 'Lower a choosen card by 2. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 10,
    val: 2,
  },
  {
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
    desc: 'Reveal a hidden card in you hand and lower it by 2. If it reaches 0, the card is discarded',
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
