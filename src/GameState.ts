import {
  BenedictionCard,
  Card,
  createDomCard,
  positions,
  MaledictionCard,
  TreasureCard,
  getMaledictionCards,
  getRandomBenediction,
  getTreasureCards,
} from './cards';
import { shuffleArray, waitFor, displayElement, hideElement, getRandomIndex, sleep } from './utils';
import { DRAW_ANIMATION_MS, NB_BENEDICTION_CARD } from './config';

export enum ActionState {
  discard,
  draw,
  choose,
  chooseTreasure,
}

export default class GameState {
  cards: Card[];
  cardById: { [id: string]: Card };
  pile: string[];
  hand: string[];
  benedictionHand: string[];
  discardedPile: string[];
  action: ActionState;
  nbCardToAction: number = 0;
  currentMalediction?: MaledictionCard;
  activeMaledictions: MaledictionCard[];
  chosenCardId?: string;

  private boardEl = document.getElementById('board') as HTMLElement;
  private cardRemainingEl = document.querySelector('#card-remaining span') as HTMLElement;
  private instructionEl = document.getElementById('instruction') as HTMLElement;
  private maledictionEl = document.getElementById('malediction') as HTMLElement;

  constructor() {
    this.pile = [];
    this.cardById = {};
    this.discardedPile = [];
    this.chosenCardId = undefined;
    this.activeMaledictions = [];
    this.resetBenediction();
    const cards: Card[] = getTreasureCards();
    shuffleArray(cards);

    this.hand = cards.slice(cards.length - 5).map((card) => card.id);

    cards.push(...getMaledictionCards());
    shuffleArray(cards);

    cards.forEach((c) => {
      this.cardById[c.id] = c;
      if (this.hand.indexOf(c.id) === -1) {
        this.pile.push(c.id);
      }
    });

    const benediction = getRandomBenediction(this.benedictionHand, this.cardById);
    benediction.pos = positions.benedictionPile();
    this.cardById[benediction.id] = benediction;
    this.initCardsVisuals();
  }

  resetBenediction() {
    this.benedictionHand = [...Array(NB_BENEDICTION_CARD)].map(() => 'empty');
  }

  private async initCardsVisuals(): Promise<void> {
    this.boardEl.innerHTML = '';
    Object.values(this.cardById).forEach((card) => {
      const handIndex = this.hand.indexOf(card.id);
      const pileIndex = this.pile.indexOf(card.id);
      const cardEl = createDomCard(card, card.id);

      let listener;
      if (handIndex !== -1) {
        listener = () => this.onClickHandCard(card as TreasureCard);
      }
      if (pileIndex === this.pile.length - 1) {
        listener = () => this.onClickPile();
      }
      this.boardEl.appendChild(cardEl);
      this.updateCard(card, pileIndex !== -1 ? pileIndex : 1, true, listener);
    });

    await sleep(DRAW_ANIMATION_MS);
    for (let i = 0; i < this.hand.length; i++) {
      const card = this.cardById[this.hand[i]];
      card.pos = positions.hand(i);
      card.hidden = false;
      this.updateCard(card, 100, false);
      await sleep(DRAW_ANIMATION_MS);
    }
    await sleep(DRAW_ANIMATION_MS);
    this.drawFullBenedictionHand();
  }

  // Listener functions

  private onClickPile(): void {
    if (this.action !== ActionState.draw) return;
    this.drawPile();
  }

  private onClickBenediction(id: string): void {
    const card = this.cardById[id] as BenedictionCard;
    if (this.action === ActionState.draw) {
      this.playBenediction(card);
    } else if (this.action === ActionState.choose) {
      this.chosenCardId = card.id;
      this.nbCardToAction--;
    }
  }

  private onClickHandCard(card: TreasureCard): void {
    const handIndex = this.hand.indexOf(card.id);
    if (this.action == ActionState.discard && card.canBeDiscarded) {
      this.discardCard(card);
      this.hand.splice(handIndex, 1);
      this.refreshHand();
    }
    if ([ActionState.choose, ActionState.chooseTreasure].includes(this.action)) {
      this.chosenCardId = card.id;
      this.nbCardToAction--;
    }
  }

  // Functionality functions

  private async chooseCard(state: ActionState): Promise<TreasureCard | BenedictionCard> {
    this.setActionState(state);
    await waitFor(() => {
      return this.nbCardToAction === 0;
    });
    const chosenCard = this.cardById[this.chosenCardId as string] as TreasureCard | BenedictionCard;
    this.chosenCardId = undefined;
    return chosenCard;
  }

  private drawBenediction(): void {
    const card = Object.values(this.cardById).find(
      (c) =>
        c instanceof BenedictionCard &&
        this.benedictionHand.indexOf(c.id) === -1 &&
        this.discardedPile.indexOf(c.id) === -1,
    ) as BenedictionCard;
    const index = this.benedictionHand.indexOf('empty');
    if (index === -1) return;
    this.benedictionHand.splice(index, 1, card.id);
    card.hidden = false;
    card.pos = positions.benedictionHand(index);
    this.updateCard(card, 1, true, () => this.onClickBenediction(card.id));

    const benedictionCard = getRandomBenediction(this.benedictionHand, this.cardById);
    benedictionCard.pos = positions.benedictionPile();
    this.cardById[benedictionCard.id] = benedictionCard;
    const cardEl = createDomCard(benedictionCard, benedictionCard.id);
    this.boardEl.append(cardEl);
    this.updateCard(benedictionCard, 1);
  }

  private drawPile(onlyTreasure: boolean = false, options?: any): void {
    let cardId;
    if (onlyTreasure) {
      const index = this.pile.findLastIndex((id) => this.cardById[id] instanceof TreasureCard);
      cardId = this.pile.splice(index, 1)[0];
    } else {
      cardId = this.pile.pop();
      if (!cardId) return;
    }
    const card = this.cardById[cardId];
    card.hidden = options?.hidden ?? false;
    card.canBeDiscarded = options?.canBeDiscarded ?? true;
    if (card instanceof TreasureCard) {
      card.pos = positions.hand(this.hand.length);
      this.hand.push(card.id);
      this.updateCard(card, 1, true, () => this.onClickHandCard(card));
      this.nbCardToAction--;
    } else if (card instanceof MaledictionCard) {
      this.displayMalediction(card);
    }
    const pileTop = this.cardById[this.pile[this.pile.length - 1]];
    if (pileTop) {
      this.updateCard(pileTop, this.pile.length, true, () => this.onClickPile());
    }
  }

  private discardCard(card: Card): void {
    const previousTopPile = this.cardById[this.discardedPile[this.discardedPile.length - 1]];
    if (previousTopPile) {
      this.updateCard(previousTopPile);
    }

    this.discardedPile.push(card.id);
    card.hidden = true;
    card.pos = positions.discard();
    this.updateCard(card, this.discardedPile.length + 1);
    if (this.action == ActionState.discard) {
      this.nbCardToAction--;
    }
    this.refreshInterface();
  }

  public async playMalediction(): Promise<void> {
    if (!this.currentMalediction) return;
    const dicardIndex = this.getRandomTreasureFromDiscardPile();

    this.discardCard(this.currentMalediction);
    hideElement(this.maledictionEl);
    const handIndex = getRandomIndex(this.hand);

    switch (this.currentMalediction.effect) {
      case 'past-weight':
        this.drawPile(true, { hidden: true });
        break;
      case 'growing-shadow':
        if (handIndex === -1) return;
        const card = this.cardById[this.hand[handIndex]] as TreasureCard;
        card.val += 2;
        this.updateCard(card, 1, false);
        await this.playValueChangeAnimation(card.id);
        break;
      case 'unavoidable-pain':
        this.drawPile(true, { canBeDiscarded: false });
        break;
      case '13th-rage':
        this.hand.forEach((id) => {
          const card = this.cardById[id] as TreasureCard;
          if (card.val === 3) {
            card.val += 1;
          }
        });
        this.refreshHand();
        break;
      case 'false-hope':
        if (handIndex === -1) return;
        this.discardCard(this.cardById[this.hand[handIndex]] as TreasureCard);
        this.hand.splice(handIndex, 1);
        this.refreshHand();
        this.drawPile();
        break;
      case 'god-faith':
        // TODO: implement preview mode
        break;
      case 'destiny-fracture':
        if (handIndex === -1) return;
        const fractureCard = this.cardById[this.hand[handIndex]] as TreasureCard;
        fractureCard.val = Math.floor(fractureCard.val / 2);
        this.updateCard(fractureCard, 1, false);
        await this.playValueChangeAnimation(fractureCard.id);
        if (fractureCard.val === 0) {
          this.discardCard(fractureCard);
          this.hand.splice(handIndex, 1);
          this.refreshHand();
          this.drawPile();
        }
        break;
      case 'past-echo':
        if (dicardIndex === -1) return;
        const discardedCard = this.cardById[this.discardedPile[dicardIndex]] as TreasureCard;
        this.discardedPile.splice(dicardIndex, 1);
        discardedCard.hidden = false;
        discardedCard.pos = positions.hand(this.hand.length);
        this.hand.push(discardedCard.id);
        this.updateCard(discardedCard, 1, true, () => this.onClickHandCard(discardedCard));
        break;
    }
    this.setActionState(ActionState.draw);
    this.nbCardToAction--;
  }

  private async playBenediction(card: BenedictionCard): Promise<void> {
    if (['second-wind'].includes(card.effect)) return;
    card.pos = positions.center();
    this.updateCard(card);
    switch (card.effect) {
      case 'evasion':
        this.setActionState(ActionState.discard);
        await waitFor(() => this.nbCardToAction === 0);
        this.setActionState(ActionState.draw);
        break;
      case 'protection':
        const chosenTreasureCard = (await this.chooseCard(ActionState.chooseTreasure)) as TreasureCard;
        chosenTreasureCard.val -= 2;
        if (chosenTreasureCard.val <= 0) {
          this.discardCard(chosenTreasureCard);
          this.hand.splice(this.hand.indexOf(chosenTreasureCard.id), 1);
          this.refreshHand();
        } else {
          this.updateCard(chosenTreasureCard, 1, false);
          await this.playValueChangeAnimation(chosenTreasureCard.id);
        }
        break;
      case 'lucky-switch':
        const chosenCard = await this.chooseCard(ActionState.choose);
        this.discardCard(chosenCard);
        if (chosenCard instanceof TreasureCard) {
          this.hand.splice(this.hand.indexOf(chosenCard.id), 1);
          this.refreshHand();
          this.drawPile(true);
        } else {
          this.benedictionHand.splice(this.benedictionHand.indexOf(chosenCard.id), 1, 'empty');
          this.drawBenediction();
        }
        break;
      case '13th-talisman':
        if (!this.currentMalediction) return;
        await this.playBenedictionUseAnimation(card);
        hideElement(this.maledictionEl);
        this.discardCard(this.currentMalediction);
        await sleep(300);
        this.discardCard(card);
        this.benedictionHand.splice(this.benedictionHand.indexOf(card.id), 100, 'empty');
        this.drawBenediction();
      case 'future-vision':
        // TODO: implement preview mode
        break;
      case 'dissipation':
        if (this.activeMaledictions.length) {
          const card = this.activeMaledictions.splice(getRandomIndex(this.activeMaledictions), 1)[0];
          this.discardCard(card);
        }
        break;
      case 'revelation':
        card.pos = positions.center();
        await sleep(800);
        const hiddenCard = Object.values(this.cardById).find((c) => this.hand.includes(c.id) && c.hidden);
        if (hiddenCard) {
          hiddenCard.hidden = false;
          this.updateCard(hiddenCard, 1, false);
          await sleep(800);
        }
        break;
    }
    this.discardCard(card);
    const index = this.benedictionHand.indexOf(card.id);
    this.benedictionHand.splice(index, 1, 'empty');
    this.drawBenediction();
    this.setActionState(ActionState.draw);
  }

  private async drawFullBenedictionHand(): Promise<void> {
    this.drawBenediction();
    await sleep(DRAW_ANIMATION_MS);
    this.drawBenediction();
    await sleep(DRAW_ANIMATION_MS);
    this.drawBenediction();
  }

  // Visual functions

  public refreshAll() {
    this.initCardsVisuals();
    this.refreshInterface();
    this.refreshHand();
    this.benedictionHand.forEach((id, index) => {
      const card = this.cardById[id] as TreasureCard;
      card.pos = positions.benedictionHand(index);
      this.updateCard(card, 1, false);
    });
  }

  public refreshInterface(): void {
    this.cardRemainingEl.innerText = this.pile.length.toString();

    if (this.action === ActionState.discard) {
      this.instructionEl.innerText = `Discard ${this.nbCardToAction} card${this.nbCardToAction > 1 ? 's' : ''}`;
    } else if (this.action === ActionState.choose) {
      this.instructionEl.innerText = 'Choose a card in your hand';
    } else if (this.action === ActionState.chooseTreasure) {
      this.instructionEl.innerText = 'Choose a treasure card in your hand ';
    } else {
      this.instructionEl.innerText = 'Draw or play a card';
    }
  }

  private async displayMalediction(card: MaledictionCard): Promise<void> {
    card.pos = positions.center();
    this.currentMalediction = card;
    this.updateCard(card, 99);
    displayElement(this.maledictionEl);
    const index = this.findBenedictionCardIndex('13th-talisman');
    if (index !== -1) {
      this.updateCard(this.cardById[this.benedictionHand[index]], 100, false);
    }
  }

  private refreshHand(): void {
    this.hand.forEach((id, index) => {
      const card = this.cardById[id] as TreasureCard;
      card.pos = positions.hand(index);
      this.updateCard(card, 1, false);
    });
  }

  private updateCard(card: Card, zIndex: number = 1, resetListener: boolean = true, listener?: any): HTMLElement {
    const cardEl = this.boardEl.querySelector(`[data-id="${card.id}"`) as HTMLElement;
    const positions = card.pos;
    cardEl.style.zIndex = zIndex.toString();
    cardEl.style.top = `${positions.top}px`;
    cardEl.style.left = `${positions.left}px`;
    cardEl.classList.toggle('locked', !card.canBeDiscarded);
    cardEl.classList.toggle('hidden', card.hidden);
    if (resetListener && card.listener) {
      cardEl.removeEventListener('click', card.listener);
    }
    if (listener) {
      card.listener = listener;
      cardEl.addEventListener('click', card.listener);
    }
    const desc = cardEl.querySelector('p') as HTMLElement;
    desc.innerText = card instanceof TreasureCard ? card.val.toString() : card.desc;
    return cardEl;
  }

  async playBenedictionUseAnimation(card: BenedictionCard): Promise<void> {
    card.pos = positions.center();
    const cardEl = this.updateCard(card, 100, false);
    await sleep(800);
    cardEl.style.transform = 'scale(1.5)';
    await sleep(400);
    cardEl.style.transform = 'scale(1.7)';
    await sleep(300);
    cardEl.style.transform = 'scale(1.5)';
    await sleep(300);
    cardEl.style.transform = 'none';
    await sleep(400);
  }

  async playValueChangeAnimation(cardId: string): Promise<void> {
    const valEl = this.boardEl.querySelector(`[data-id="${cardId}"] p`) as HTMLElement;
    valEl.style.fontSize = '42px';
    await sleep(600);
    valEl.style.fontSize = '24px';
  }

  // Utility functions

  public setActionState(state: ActionState, nbCard: number = 1): void {
    this.nbCardToAction = nbCard;
    this.action = state;
    this.refreshInterface();
  }

  public getSum(): number {
    return this.hand.reduce((r, id: string) => {
      const card = this.cardById[id] as TreasureCard;
      return r + card.val;
    }, 0);
  }

  private findBenedictionCardIndex(effect: string): number {
    return this.benedictionHand.findIndex((id) => {
      const card = this.cardById[id] as BenedictionCard;
      return card && card.effect === effect;
    });
  }

  private getRandomTreasureFromDiscardPile(): number {
    if (!this.discardedPile.some((id) => this.cardById[id] instanceof TreasureCard)) {
      return -1;
    }
    let index = getRandomIndex(this.discardedPile);
    while (!(this.cardById[this.discardedPile[index]] instanceof TreasureCard)) {
      index = getRandomIndex(this.discardedPile);
    }
    return index;
  }

  public async activateLastChance(): Promise<void> {
    const index = this.findBenedictionCardIndex('second-wind');
    if (index === -1) return;
    const card = this.cardById[this.benedictionHand[index]] as BenedictionCard;
    await this.playBenedictionUseAnimation(card);

    [...this.benedictionHand, ...this.hand].forEach((id) => {
      const card = this.cardById[id];
      this.discardCard(card);
    });
    this.resetBenediction();
    this.hand = [];
    await sleep(800);
    await this.drawFullBenedictionHand();
  }
}
