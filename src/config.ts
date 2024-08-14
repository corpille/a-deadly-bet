import { BenedictionCard, Card } from './cards';

export const maledictionCards: Array<Card> = [
  //   { type: 'm', effect: 'hidden', name: 'Past Weight', desc: 'Add a hidden card to your hand' },
  //   { type: 'm', effect: 'add-2', name: 'Growing shadows', desc: 'Add 2 points to one of the card in your hand' }, // If it goes above 13 pick another one until good
  //   {
  //     type: 'm',
  //     effect: 'cancel-discard',
  //     name: 'Unavoidable pain',
  //     desc: "The next card you picked can't be discarded",
  //   }, // can't discard the next card that you pick
  //   { type: 'm', effect: 'posion-treasure', name: 'Poison treasure', desc: 'Add a poisonned treasure to your hand' }, //  can't be affected by the other special cards
  //   { type: 'm', effect: '13th-rage', name: 'Rage of the 13th', desc: 'Every card of 3 gain a point' },
  //   {
  //     type: 'm',
  //     effect: 'false-hope',
  //     name: 'False Hope',
  //     desc: 'Replace a card in your deck with one on top of the pile',
  //   }, // replace a card with the one on top of the pile
  //   {
  //     type: 'm',
  //     effect: 'interior-storm',
  //     name: 'Faith of the gods',
  //     desc: 'pick two random card in the pile, the sum must not be 13',
  //   },
  //   {
  //     type: 'm',
  //     effect: 'destiny-fracture',
  //     name: 'Fracture of destiny',
  //     desc: 'Divide one card by two, if 0 replace by one on the pile',
  //   },
  //   {
  //     type: 'm',
  //     effect: 'past-echo',
  //     name: 'Echo of the past',
  //     desc: 'Pick a random discarded card and add it to your hand',
  //   },
  //   {
  //     type: 'm',
  //     effect: 'quicksand',
  //     name: 'Quicksand',
  //     desc: '[Active], discard one card before you pick one until the end of the game',
  //   },
];

export const benedictionCards: Array<Card> = [
  new BenedictionCard('Evasion', 'Discard a card in your hand', 'evasion'),
  new BenedictionCard('Protection', 'Lower a choosen card by 2. If it reaches 0, the card is discarded', 'protection'),
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
