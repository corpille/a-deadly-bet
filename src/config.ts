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

export function getBenedictionCards(): BenedictionCard[] {
  return [
    new BenedictionCard('Evasion', 'Discard a card in your hand', 'evasion'),
    new BenedictionCard(
      'Protection',
      'Lower a choosen card by 2. If it reaches 0, the card is discarded',
      'protection',
    ),
    new BenedictionCard('Lucky switch', 'Switch one card from you hand by one on top of the pile', 'lucky-switch'),
    new BenedictionCard('Vision of the future', 'Peak at the next 3 card, you can discard 2 max', 'future-vision'),
    new BenedictionCard('Dissipation', 'Remove an active malediction', 'dissipation'),
    new BenedictionCard(
      'Revelation',
      'Reveal a hidden card and lower its value by 2. If it reaches 0, the card is discarded',
      'revelation',
    ),
    new BenedictionCard('13th taslisman', 'Shield you from loosing but remove all of your cards', '13th-talisman'),
    new BenedictionCard('Second breath', 'Cancels the next malediction card', 'second-breath'),
  ];
}

export function getTreasureCards(): Array<TreasureCard> {
  const availableCards: Array<TreasureCard> = [...Array(7).keys()].map((i) => new TreasureCard(i + 1));
  return [...availableCards, ...availableCards, ...availableCards, ...availableCards];
}
