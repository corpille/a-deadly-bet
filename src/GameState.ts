import {
  BenedictionCard,
  Card,
  createDomCard,
  MaledictionCard,
  TreasureCard,
  getMaledictionCards,
  getRandomBenediction,
  getTreasureCards,
} from './cards';
import { shuffleArray, waitFor, displayElement, hideElement, getRandomIndex, sleep, getElementById } from './utils';
import { cardWidth, DRAW_ANIMATION_MS, NB_BENEDICTION_CARD, positions } from './config';

export enum ActionState {
  discard,
  draw,
  choose,
  chooseTreasure,
  choosePreview,
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

  private boardEl = getElementById('board');
  private cardRemainingEl = document.querySelector('#card-remaining span') as HTMLElement;
  private instructionEl = getElementById('instruction');
  private maledictionEl = getElementById('malediction');

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
      if (pileIndex !== -1) {
        card.inPile = true;
        listener = () => this.onClickPile();
      }
      this.boardEl.appendChild(cardEl);
      this.updateCard(card, pileIndex !== -1 ? pileIndex : 1, listener);
    });

    await sleep(DRAW_ANIMATION_MS);
    for (let i = 0; i < this.hand.length; i++) {
      const card = this.cardById[this.hand[i]];
      card.pos = positions.hand(i);
      card.hidden = false;
      this.updateCard(card, 100);
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
    if (card.locked) return;
    const handIndex = this.hand.indexOf(card.id);
    if (this.action == ActionState.discard) {
      this.discardCardFrom(card, this.hand);
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
    const card = this.findBenedictionPile();
    const index = this.benedictionHand.indexOf('empty');
    if (index === -1) return;
    this.benedictionHand.splice(index, 1, card.id);
    card.hidden = false;
    card.pos = positions.benedictionHand(index);
    this.updateCard(card, 1, () => this.onClickBenediction(card.id));

    const benedictionCard = getRandomBenediction(this.benedictionHand, this.cardById);
    benedictionCard.pos = positions.benedictionPile();
    this.cardById[benedictionCard.id] = benedictionCard;
    const cardEl = createDomCard(benedictionCard, benedictionCard.id);
    this.boardEl.append(cardEl);
    this.updateCard(benedictionCard, 1, null);
  }

  private findFirstTreasureCardIdOnPile() {
    const index = this.pile.findLastIndex((id) => this.cardById[id] instanceof TreasureCard);
    return this.pile.splice(index, 1)[0];
  }

  private drawPile(onlyTreasure: boolean = false, options?: any): void {
    let cardId = onlyTreasure ? this.findFirstTreasureCardIdOnPile() : this.pile.pop();
    if (!cardId) return;
    const card = this.cardById[cardId];
    card.hidden = options?.hidden ?? false;
    card.locked = options?.locked ?? false;
    card.inPile = false;
    if (card instanceof TreasureCard) {
      this.addCardToHand(card);
      this.nbCardToAction--;
    } else if (card instanceof MaledictionCard) {
      this.displayMalediction(card);
    }
  }

  private addCardToHand(card: TreasureCard): void {
    card.pos = positions.hand(this.hand.length);
    this.hand.push(card.id);
    card.inDiscard = false;
    this.updateCard(card, 98, () => this.onClickHandCard(card));
  }

  private discardCard(card: Card): void {
    this.discardedPile.push(card.id);
    card.hidden = true;
    card.locked = false;
    card.pos = positions.discard();
    if (card instanceof TreasureCard) {
      card.val = card.defaultVal;
    }
    card.inDiscard = true;
    this.updateCard(card, this.discardedPile.length + 1, null);
    if (this.action == ActionState.discard) {
      this.nbCardToAction--;
    }
    this.refreshInterface();
  }

  private discardCardFrom(card: Card, from: string[]) {
    this.discardCard(card);
    from.splice(from.indexOf(card.id), 1, ...(card instanceof BenedictionCard ? ['empty'] : []));
    if (card instanceof TreasureCard) {
      this.refreshHand();
    }
  }

  public async playMalediction(): Promise<void> {
    if (!this.currentMalediction) return;
    const dicardIndex = this.getRandomTreasureFromDiscardPile();

    this.discardCard(this.currentMalediction);
    hideElement(this.maledictionEl);
    const randomHandIndex = getRandomIndex(this.hand);

    switch (this.currentMalediction.effect) {
      case 'past-weight':
        this.drawPile(true, { hidden: true });
        break;
      case 'growing-shadow':
        if (randomHandIndex === -1) return;
        const card = this.cardById[this.hand[randomHandIndex]] as TreasureCard;
        card.val += 2;
        this.updateCard(card, 1);
        await this.playValueChangeAnimation(card.id);
        break;
      case 'unavoidable-pain':
        this.drawPile(true, { locked: true });
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
        if (randomHandIndex === -1) return;
        this.discardCardFrom(this.cardById[this.hand[randomHandIndex]], this.hand);
        this.drawPile();
        break;
      case 'destiny-fracture':
        if (randomHandIndex === -1) return;
        const fractureCard = this.cardById[this.hand[randomHandIndex]] as TreasureCard;
        fractureCard.val = Math.floor(fractureCard.val / 2);
        this.updateCard(fractureCard, 1);
        await this.playValueChangeAnimation(fractureCard.id);
        if (fractureCard.val === 0) {
          this.discardCardFrom(fractureCard, this.hand);
          this.drawPile();
        }
        break;
      case 'past-echo':
        if (dicardIndex === -1) return;
        const discardedCard = this.cardById[this.discardedPile[dicardIndex]] as TreasureCard;
        this.discardedPile.splice(dicardIndex, 1);
        discardedCard.hidden = false;
        this.addCardToHand(discardedCard);
        break;
    }
    this.setActionState(ActionState.draw);
    this.nbCardToAction--;
  }

  private async playBenediction(card: BenedictionCard): Promise<void> {
    if (['second-wind'].includes(card.effect)) return;
    if (!['revelation', 'future-vision'].includes(card.effect)) {
      card.pos = positions.center();
      this.updateCard(card, 1, null);
    }
    if (card.effect === '13th-talisman' && !this.currentMalediction) {
      return;
    }
    switch (card.effect) {
      case 'evasion':
        this.setActionState(ActionState.discard);
        await waitFor(() => this.nbCardToAction === 0);
        this.setActionState(ActionState.draw);
        break;
      case 'protection':
        const chosenTreasureCard = (await this.chooseCard(ActionState.chooseTreasure)) as TreasureCard;
        chosenTreasureCard.val -= card.val ?? 1;
        if (chosenTreasureCard.val <= 0) {
          this.discardCardFrom(chosenTreasureCard, this.hand);
        } else {
          this.updateCard(chosenTreasureCard, 1);
          await this.playValueChangeAnimation(chosenTreasureCard.id);
        }
        break;
      case 'lucky-switch':
        const chosenCard = await this.chooseCard(ActionState.choose);
        this.discardCardFrom(chosenCard, chosenCard instanceof TreasureCard ? this.hand : this.benedictionHand);
        if (chosenCard instanceof TreasureCard) {
          this.drawPile(true);
        } else {
          this.drawBenediction();
        }
        break;
      case '13th-talisman':
        if (!this.currentMalediction) return;
        await this.playBenedictionUseAnimation(card);
        hideElement(this.maledictionEl);
        this.discardCard(this.currentMalediction);
        await sleep(300);
        this.discardCardFrom(card, this.benedictionHand);
        this.drawBenediction();
        break;
      case 'future-vision':
        const cards = this.displayPilePreview();
        const chosenKeptCard = await this.chooseCard(ActionState.choosePreview);
        cards.forEach((card) => {
          if (card.id !== chosenKeptCard.id) {
            this.discardCard(card);
          }
        });

        if (chosenKeptCard instanceof TreasureCard) {
          this.addCardToHand(chosenKeptCard);
        } else {
          this.replaceBenediction(card);
          await sleep(800);
          this.displayMalediction(chosenKeptCard);
          return;
        }
        break;
      case 'revelation':
        await sleep(800);
        const hiddenCard = Object.values(this.cardById).find((c) => this.hand.includes(c.id) && c.hidden);
        if (!hiddenCard) return;
        hiddenCard.hidden = false;
        this.updateCard(hiddenCard, 1);
        await sleep(800);
        break;
    }
    this.replaceBenediction(card);
  }

  replaceBenediction(card: BenedictionCard) {
    this.discardCardFrom(card, this.benedictionHand);
    this.drawBenediction();
    this.setActionState(ActionState.draw);
  }

  displayPilePreview(): Card[] {
    const cards = this.pile.splice(Math.min(this.pile.length - 3, 0), 3).map((id) => {
      const card = this.cardById[id];
      card.pos = positions.center();
      card.hidden = false;
      return card;
    });
    cards[0].pos.left -= cardWidth() + 16;
    cards[2].pos.left += cardWidth() + 16;
    cards.forEach((card) =>
      this.updateCard(card, 99, () => {
        this.chosenCardId = card.id;
        this.nbCardToAction--;
      }),
    );
    return cards;
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
    this.pile.forEach((id, index) => {
      this.cardById[id].pos = positions.pile();
      this.updateCard(this.cardById[id], index + 1)
    });
    this.discardedPile.forEach((id, index) => {
      this.cardById[id].pos = positions.discard();
      this.updateCard(this.cardById[id], index + 1)
    });
    const benedictionPile = this.findBenedictionPile()
    benedictionPile.pos = positions.benedictionPile();
    this.updateCard(benedictionPile, 1)
    this.initCardsVisuals();
    this.refreshInterface();
    this.refreshHand();
    this.refreshBenedictionHand();
  }

  public refreshInterface(): void {
    this.cardRemainingEl.innerText = this.pile.length.toString();

    let text = 'Draw or play a card';
    switch (this.action) {
      case ActionState.discard:
        text = `Discard ${this.nbCardToAction} card${this.nbCardToAction > 1 ? 's' : ''}`;
        break;
      case ActionState.choose:
        text = `Choose a card in your hand`;
        break;
      case ActionState.chooseTreasure:
        text = `Choose a treasure card in your hand`;
        break;
      case ActionState.choosePreview:
        text = `Choose a card to keep`;
        break;
    }
    this.instructionEl.innerText = text;
  }

  private async displayMalediction(card: MaledictionCard): Promise<void> {
    card.pos = positions.center();
    this.currentMalediction = card;
    this.updateCard(card, 99, null);
    displayElement(this.maledictionEl);
    const index = this.findBenedictionCardIndex('13th-talisman');
    if (index !== -1) {
      this.updateCard(this.cardById[this.benedictionHand[index]], 100);
    }
  }

  private refreshHand(): void {
    this.hand.forEach((id, index) => {
      const card = this.cardById[id] as TreasureCard;
      card.pos = positions.hand(index);
      this.updateCard(card, 1);
    });
  }

  private refreshBenedictionHand(): void {
    this.benedictionHand.forEach((id, index) => {
      const card = this.cardById[id] as BenedictionCard;
      card.pos = positions.benedictionHand(index);
      this.updateCard(card, 1);
    });
  }

  private updateCard(card: Card, zIndex: number = 1, listener: any = card.listener): HTMLElement {
    const cardEl = getElementById(card.id);
    const positions = card.pos;
    cardEl.style.zIndex = zIndex.toString();
    cardEl.style.top = `${positions.top}px`;
    cardEl.style.left = `${positions.left}px`;
    cardEl.classList.toggle('locked', card.locked);
    cardEl.classList.toggle('hidden', card.hidden);
    cardEl.classList.toggle('pile', card.inPile);
    cardEl.classList.toggle('discarded', card.inDiscard);
    cardEl.removeEventListener('click', card.listener);
    card.listener = listener;
    if (card.listener) {
      cardEl.addEventListener('click', card.listener);
    }
    const desc = cardEl.querySelector('p') as HTMLElement;
    desc.innerText = card instanceof TreasureCard ? card.val.toString() : card.desc;
    return cardEl;
  }

  async playBenedictionUseAnimation(card: BenedictionCard): Promise<void> {
    card.pos = positions.center();
    const cardEl = this.updateCard(card, 100, null);
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
    const valEl = this.boardEl.querySelector(`#${cardId} p`) as HTMLElement;
    valEl.style.fontSize = '3rem';
    await sleep(600);
    valEl.style.fontSize = '1.5rem';
  }

  // Utility functions

  private findBenedictionPile() {
    return Object.values(this.cardById).find(
      (c) =>
        c instanceof BenedictionCard &&
        this.benedictionHand.indexOf(c.id) === -1 &&
        this.discardedPile.indexOf(c.id) === -1,
    ) as BenedictionCard;
  }

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
