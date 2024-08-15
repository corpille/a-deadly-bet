import { BenedictionCard, Card, displayCards, MaledictionCard, pickCard, TreasureCard } from './cards';
import { shuffleCards, waitFor, getRandomIndex } from './utils';
import { getBenedictionCards, getTreasureCards } from './config';

export enum ActionState {
  discard,
  draw,
  choose,
}

export default class GameState {
  cards: Card[];
  discard: Card[];
  hand: Card[];
  bonus: Card[];
  action: ActionState;
  activeMaledictions: MaledictionCard[] = [];
  currentMalediction?: MaledictionCard;
  currentBenediction?: BenedictionCard;
  nextTreasureModifier?: Function;
  hasDrawn: boolean = false;
  hasDiscarded: boolean = false;
  chosenCard: number = -1;

  handEl = document.getElementById('hand') as HTMLElement;
  private pileEl = document.getElementById('pile') as HTMLElement;
  private discardEl = document.getElementById('discard') as HTMLElement;
  private instruction = document.getElementById('instruction') as HTMLElement;

  constructor() {
    this.cards = [...getTreasureCards(), ...getBenedictionCards()];
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
    this.hasDiscarded = true;
    this.refresh();
  }

  refresh(): void {
    displayCards(this.handEl, this.hand, this.clickCard.bind(this));
    this.pileEl.innerText = this.cards.length.toString();
    this.discardEl.innerText = this.discard.length.toString();
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
    if (state === ActionState.discard) {
      this.hasDiscarded = false;
    }
    if (state === ActionState.draw) {
      this.hasDrawn = false;
    }
    this.action = state;
    this.refresh();
  }

  async clickCard(event: MouseEvent): Promise<void> {
    const i = Array.from(this.handEl.children).indexOf(event.currentTarget as HTMLElement);
    const card = this.hand[i];
    if (this.action === ActionState.discard && card.canBeDiscarded) {
      this.discardCard(i);
    } else if (this.action === ActionState.choose && card instanceof TreasureCard) {
      this.chosenCard = i;
    } else if (this.action === ActionState.draw && card instanceof BenedictionCard) {
      this.discardCard(i);
      await this.playBenediction(card);
    }
  }

  async playBenediction(card: BenedictionCard): Promise<void> {
    switch (card.effect) {
      case 'evasion':
        console.log('evasion', this.hasDiscarded);
        this.setActionState(ActionState.discard);
        await waitFor(() => this.hasDiscarded);
        this.setActionState(ActionState.draw);
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
        const card = pickCard(this);
        if (card) {
          this.hand.push(card);
        }
        break;
      case 'future-vision':
        break;
      case 'dissipation':
        if (this.activeMaledictions.length) {
          const card = this.activeMaledictions.splice(getRandomIndex(this.activeMaledictions), 1)[0];
          this.discard.push(card);
        }
        break;
      case 'revelation':
        const hiddenCardIndex = this.hand.findIndex((c) => c.hidden);
        this.hand[hiddenCardIndex].hidden = false;
        break;
      case 'second-breath':
        // TODO
        break;
    }
  }

  getARandomTreasureIndex(): number {
    const myTreasures = this.hand.map(({ type }, index) => ({ type, index })).filter(({ type }) => type === 't');
    if (myTreasures.length) {
      return myTreasures[getRandomIndex(myTreasures)].index;
    }
    return -1;
  }

  playMelediction(): void {
    console.log('playMelediction', this.currentMalediction);
    if (!this.currentMalediction) return;
    const treasureIndex = this.getARandomTreasureIndex();
    switch (this.currentMalediction.effect) {
      case 'past-weight':
        const treasureCard = pickCard(this, 't');
        if (treasureCard) {
          treasureCard.hidden = true;
          this.hand.push(treasureCard);
        }
        break;
      case 'growing-shadow':
        if (treasureIndex !== -1) {
          (this.hand[treasureIndex] as TreasureCard).val += 2;
        }
        break;
      case 'unavoidable-pain':
        this.nextTreasureModifier = (c: TreasureCard) => {
          c.canBeDiscarded = false;
          this.nextTreasureModifier = undefined;
        };
        break;
      case 'poison-trasure':
        // TODO
        break;
      case '13th-rage':
        this.hand.forEach((c) => {
          if (c instanceof TreasureCard && c.val === 3) {
            c.val += 1;
          }
        });
        break;
      case 'false-hope':
        this.discardCard(getRandomIndex(this.hand));
        const card = pickCard(this);
        if (card) {
          this.hand.push(card);
        }
        break;
      case 'god-faith':
        // TODO
        break;
      case 'destiny-fracture':
        if (treasureIndex !== -1) {
          const treasure = this.hand[treasureIndex] as TreasureCard;
          treasure.val = Math.floor(treasure.val / 2);
          if (treasure.val === 0) {
            this.discardCard(treasureIndex);
            const card = pickCard(this);
            if (card) {
              this.hand.push(card);
            }
          }
        }
        break;
      case 'past-echo':
        const discardedCard = this.discard.slice(Math.floor(Math.random() * this.discard.length))[0];
        if (discardedCard) {
          this.hand.push(discardedCard);
        }
        break;
      case 'quicksand':
        this.activeMaledictions.push(this.currentMalediction);
        break;
    }
    this.refresh();
    this.discard.push(this.currentMalediction);
    this.currentMalediction = undefined;
  }
}
