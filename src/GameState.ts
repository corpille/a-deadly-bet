import { Card, playCard, displayCards } from './cards';
import { treasureCards, shuffleCards } from './utils';
import { specialsCards } from './config';

export default class GameState {
  cards: Array<Card>;
  discard: Array<Card>;
  hand: Array<Card>;
  bonus: Array<Card>;
  action: string;
  pickedCard: Card | undefined;
  handEl = document.getElementById('hand') as HTMLElement;

  private pileEl = document.getElementById('pile') as HTMLElement;
  private discardEl = document.getElementById('discard') as HTMLElement;
  private pickedCardEl = document.getElementById('picked-card') as HTMLElement;

  constructor() {
    this.cards = [...treasureCards, ...specialsCards];
    shuffleCards(this.cards);
    this.hand = [];
    this.discard = [];
    this.bonus = [];
    this.pileEl.classList.add('has-cards');
    this.discardEl.classList.remove('has-cards');
  }

  discardCard(index: number): void {
    this.discard.push(this.hand.splice(index, 1)[0]);
    this.discardEl.classList.add('has-cards');
    this.refresh();
  }

  refresh(): void {
    displayCards(this.handEl, this.hand, (e: any) => playCard(this, e));
    if (this.pickedCard) {
      displayCards(this.pickedCardEl, [this.pickedCard]);
    }
    this.pileEl.innerText = this.cards.length.toString();
  }

  getSum(): number {
    return this.hand.reduce((r, c: Card) => r + (c.type === 't' && c.val ? c.val : 0), 0);
  }

  checkSpecials(): void {
    const saveCardIndex = this.hand.findIndex((c) => c.type === 's' && c.effect === '13th-talisman');
    if (saveCardIndex !== -1) {
      this.discard.push(...this.hand);
      this.hand = [];
    }
  }
}
