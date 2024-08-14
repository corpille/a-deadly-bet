import { BenedictionCard, Card, displayCards, pickCards, TreasureCard } from './cards';
import { treasureCards, shuffleCards, waitFor } from './utils';
import { benedictionCards } from './config';

export enum ActionState {
  discard,
  pick,
  choose,
}

export default class GameState {
  cards: Array<Card>;
  discard: Array<Card>;
  hand: Array<Card>;
  bonus: Array<Card>;
  action: ActionState;
  pickedCard?: Card;
  chosenCard: number = -1;

  handEl = document.getElementById('hand') as HTMLElement;
  private pileEl = document.getElementById('pile') as HTMLElement;
  private discardEl = document.getElementById('discard') as HTMLElement;
  private pickedCardEl = document.getElementById('picked-card') as HTMLElement;
  private instruction = document.getElementById('instruction') as HTMLElement;

  constructor() {
    this.cards = [...treasureCards, ...benedictionCards];
    shuffleCards(this.cards);
    this.hand = [];
    this.discard = [];
    this.bonus = [];
    this.pileEl.classList.add('has-cards');
    this.discardEl.classList.remove('has-cards');
    this.instruction.innerText = 'Discard 3 cards';
  }

  discardCard(index: number): void {
    this.discard.push(this.hand.splice(index, 1)[0]);
    this.discardEl.classList.add('has-cards');
    this.refresh();
  }

  refresh(): void {
    displayCards(this.handEl, this.hand, this.clickCard.bind(this));
    if (this.pickedCard) {
      displayCards(this.pickedCardEl, [this.pickedCard]);
    }
    this.pileEl.innerText = this.cards.length.toString();
    if (this.action === ActionState.discard) {
      this.instruction.innerText = 'Discard 1 card';
    } else if (this.action === ActionState.choose) {
      this.instruction.innerText = 'Choose a card';
    } else {
      this.instruction.innerText = 'Pick or play a card';
    }
  }

  getSum(): number {
    return this.hand.reduce((r, c: Card) => r + (c instanceof TreasureCard && c.val ? c.val : 0), 0);
  }

  checkSpecials(): void {
    const saveCardIndex = this.hand.findIndex((c) => c instanceof BenedictionCard && c.effect === '13th-talisman');
    if (saveCardIndex !== -1) {
      this.discard.push(...this.hand);
      this.hand = [];
    }
  }

  setActionState(state: ActionState): void {
    this.action = state;
    this.refresh();
  }

  async clickCard(event: MouseEvent): Promise<void> {
    const i = Array.from(this.handEl.children).indexOf(event.currentTarget as HTMLElement);
    if (this.action === ActionState.discard) {
      console.log('discard', i);
      this.discardCard(i);
    } else if (this.hand[i].type === 't' && this.action === ActionState.choose) {
      this.chosenCard = i;
    } else {
      const card = this.hand[i];
      if (card instanceof BenedictionCard) {
        this.discardCard(i);
        await this.playBenediction(card);
      }
    }
  }

  async playBenediction(card: BenedictionCard): Promise<void> {
    const handLenght = this.hand.length;
    switch (card.effect) {
      case 'evasion':
        this.setActionState(ActionState.discard);
        await waitFor(() => this.hand.length === handLenght - 1);
        break;
      case 'protection':
        this.setActionState(ActionState.choose);
        await waitFor(() => this.chosenCard > -1);
        if ((this.hand[this.chosenCard] as TreasureCard).val - 2 <= 0) {
          this.hand.splice(this.chosenCard, 1);
        } else {
          (this.hand[this.chosenCard] as TreasureCard).val -= 2;
        }
        this.chosenCard = -1;
        break;
      case 'lucky-switch':
        this.setActionState(ActionState.choose);
        await waitFor(() => this.chosenCard > -1);
        this.hand.splice(this.chosenCard, 1);
        this.hand.push(...pickCards(this, 1));
        break;
      case 'future-vision':
        break;
      case 'dissipation':
        break;
      case 'revelation':
        break;
      case 'second-breath':
        break;
    }
    this.setActionState(ActionState.pick);
  }
}
