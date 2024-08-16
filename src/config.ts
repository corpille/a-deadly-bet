import { BenedictionCard, TreasureCard, MaledictionCard } from './cards';

export function getMaledictionCards(): MaledictionCard[] {
  return [
    new MaledictionCard('Past Weight', 'Add a hidden treasure from the pile to your hand', 'past-weight'),
    new MaledictionCard('Growing shadow', 'Add 2 points to one of the card in your hand', 'growing-shadow'),
    new MaledictionCard('Unavoidable pain', "The next treasure card you picked can't be discarded", 'unavoidable-pain'),
    new MaledictionCard('Poison treasure', 'Add a poisonned treasure to your hand', 'poison-trasure'), // (not coded)  can't be affected by the other special cards
    new MaledictionCard('Rage of the 13th', 'Add 1 to every card of value 3', '13th-rage'),
    new MaledictionCard('False Hope', 'Replace a random card in your hand with one on top of the pile', 'false-hope'),
    new MaledictionCard('Faith of the gods', 'pick two random card in the pile, the sum must not be 13', 'god-faith'), // (not coded)
    new MaledictionCard(
      'Fracture of destiny',
      'Divide one treasure card by two, if 0 replace by one on the pile',
      'destiny-fracture',
    ),
    new MaledictionCard('Echo of the past', 'Pick a random discarded card and add it to your hand', 'past-echo'),
    new MaledictionCard('Quicksand', '[Active] Discard one card before you pick one', 'quicksand'),
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
  {
    name: 'Vision of the future',
    desc: 'Reveal the first 3 card on the pile choose 1 and discard 2',
    effect: 'future-vision',
  },
  { name: 'Dissipation', desc: 'Remove an active malediction', effect: 'dissipation' },
  {
    name: 'Revelation',
    desc: 'Reveal a hidden card and lower its value by 2. If it reaches 0, the card is discarded',
    effect: 'revelation',
  },
  { name: '13th taslisman', desc: 'Shield you from loosing but remove all of your cards', effect: '13th-talisman' },
  { name: 'Second breath', desc: 'Cancels the next malediction card', effect: 'second-breath' },
];

export function getRandomBenediction(): BenedictionCard {
  //return new BenedictionCard(benedictions[2]);
  return new BenedictionCard(benedictions[Math.floor(Math.random() * benedictions.length)]);
}

export function getTreasureCards(): Array<TreasureCard> {
  const availableCards: Array<TreasureCard> = [];
  for (let i = 0; i < 4; i++) {
    // nb set
    for (let j = 0; j < 7; j++) {
      // max value
      availableCards.push(new TreasureCard(i + 1));
    }
  }
  return availableCards;
}
