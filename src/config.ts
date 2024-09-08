export const rem = (nb: number) => Math.round((maxWidth() / 100) * 0.833333) * nb;
export const maxHeight = () => window.innerHeight;
export const maxWidth = () => window.innerWidth;
export const cardHeight = () => rem(15);
export const cardWidth = () => cardHeight() * 0.65;

export const INITIAL_DRAW = 3;
export const DRAW_ANIMATION_MS = 200;
export const NB_BENEDICTION_CARD = 2;

export const positions = {
  pile: () => ({ top: rem(1), left: rem(7) }),
  benedictionPile: () => ({ top: rem(1), left: rem(7) + (cardWidth() + rem(1)) }),
  discard: () => ({ top: rem(1), left: rem(7) + (cardWidth() + rem(1)) * 2 }),
  hand: (index: number) => ({
    top: maxHeight() - cardHeight() - rem(1),
    left: rem(7) + (cardWidth() + rem(1)) * index,
  }),
  benedictionHand: (index: number) => ({
    top: maxHeight() - cardHeight() - rem(1),
    left: maxWidth() - (cardWidth() + rem(1)) * (NB_BENEDICTION_CARD - index),
  }),
  center: () => ({ top: maxHeight() / 2 - cardHeight() / 2, left: maxWidth() / 2 - cardWidth() / 2 }),
  activeBenediction: () => ({ top: rem(1), left: maxWidth() - (cardWidth() + rem(1)) }),
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
  { name: 'Evasion', desc: 'Reduce a card value to 0', effect: 'evasion', weight: 4 },
  {
    name: 'Protection I',
    desc: 'Lower a chosen card by 1. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 12,
    val: 1,
  },
  {
    name: 'Protection II',
    desc: 'Lower a chosen card by 2. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 10,
    val: 2,
  },
  {
    name: 'Protection III',
    desc: 'Lower a chosen card by 3. If it reaches 0, the card is discarded',
    effect: 'protection',
    weight: 8,
    val: 3,
  },
  {
    name: 'Lucky switch',
    desc: 'Switch one card from your hand by one of the same type',
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
    name: 'Second wind',
    desc: 'Shield you from losing but remove all of your cards',
    effect: 'second-wind',
    weight: 1,
  },
  {
    name: '13th talisman',
    desc: 'Cancel a malediction card or discard to gain 2 credits',
    effect: '13th-talisman',
    weight: 4,
  },
];

export const deaths = [
  'while swallowing a watermelon',
  'opening a can of tuna',
  'falling from a bench',
  'getting hit by a tortoise shell',
  'while attempting to ride a snail',
  'trying to obtain the world record for the longest wedgy',
  'protesting helmet regulation',
  'falling into a giant bowl of jello',
  'crushed by a pile of my collectioned snow globes',
];
