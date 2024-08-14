import { Card } from './cards';

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

export const specialsCards: Array<Card> = [
  { type: 's', effect: 'evasion', name: 'Evasion', desc: 'Discard a card in your hand' },
  { type: 's', effect: 'protection', name: 'Protection', desc: 'Lower a random card by 2, if 0 discard the card' },
  {
    type: 's',
    effect: 'lucky-switch',
    name: 'Lucky switch',
    desc: 'Switch one card from you hand by one on top of the deck',
  },
  {
    type: 's',
    effect: 'future-vision',
    name: 'Vision of the future',
    desc: 'Peak at the next 3 card, you can discard 2 max',
  },
  { type: 's', effect: 'dissipation', name: 'Dissipation', desc: 'Remove an active malediction' },
  { type: 's', effect: 'revelation', name: 'Revelation', desc: 'Reveal a hidden card ans lower it by 2, if 0 discard' },
  {
    type: 's',
    effect: '13th-talisman',
    name: '13th taslisman',
    desc: 'Shield you from loosing. Remove all your card',
  },
  { type: 's', effect: 'second-breath', name: 'second-breath', desc: 'Cancels the next malediction card' },
];
