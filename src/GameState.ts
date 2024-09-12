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
import {
  shuffleArray,
  waitFor,
  displayElement,
  hideElement,
  getRandomIndex,
  sleep,
  getElementById,
  querySelector,
} from './utils';
import { cardHeight, cardWidth, DRAW_ANIMATION_MS, INITIAL_DRAW, NB_BENEDICTION_CARD, positions, rem } from './config';
import {
  deathEl,
  playBenedictionHandPresentation,
  playHandPresentation,
  playPilePresentation,
  playTutorialBegining,
  showDeath,
} from './animation';

export enum ActionState {
  discard,
  draw,
  choose,
  chooseTreasure,
  choosePreview,
  playMalediction,
}

export default class GameState {
  cardById: { [id: string]: Card };
  pile: string[];
  hand: string[];
  benedictionHand: string[];
  discardedPile: string[];
  action: ActionState;
  currentMalediction?: MaledictionCard;
  chosenCardId?: string;
  ready: boolean = false;
  benedictionCredit: number;

  private boardEl = getElementById('board');
  private cardRemainingEl = querySelector('#card-remaining span');
  private instructionEl = getElementById('instruction');
  private maledictionEl = getElementById('malediction');
  private sidebarEl = getElementById('sidebar');
  private indexEl = getElementById('index');

  constructor() {
    this.pile = [];
    this.cardById = {};
    this.discardedPile = [];
    this.benedictionCredit = 2;
    this.chosenCardId = undefined;
    this.resetBenediction();
    const cards: Card[] = getTreasureCards();
    shuffleArray(cards);

    this.hand = cards.slice(cards.length - INITIAL_DRAW).map((card) => card.id);

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
    this.sidebarEl.classList.add('active');
    this.indexEl.style.height = '100%';
    this.initCardsVisuals();
  }

  resetBenediction() {
    this.benedictionHand = [...Array(NB_BENEDICTION_CARD)].map(() => 'empty');
  }

  private async initCardsVisuals(): Promise<void> {
    const hasDoneTuto = localStorage.getItem('adb-tutorial') === 'done';
    if (!hasDoneTuto) {
      await playTutorialBegining();
    } else {
      await showDeath();
    }
    this.boardEl.innerHTML = '';
    Object.values(this.cardById).forEach(async (card) => {
      const handIndex = this.hand.indexOf(card.id);
      const pileIndex = this.pile.indexOf(card.id);
      const pos = card.pos;
      card.pos = { top: -cardHeight(), left: -cardWidth() };
      const cardEl = createDomCard(card);
      this.boardEl.appendChild(cardEl);
      this.updateCard(card, pileIndex !== -1 ? pileIndex : 1);

      await sleep(300);
      card.pos = pos;

      let listener;
      if (handIndex !== -1) {
        listener = () => this.onClickHandCard(card as TreasureCard);
      }
      if (pileIndex !== -1) {
        card.inPile = true;
        listener = () => this.onClickPile();
      }
      this.updateCard(card, pileIndex !== -1 ? pileIndex : 1, listener);
    });

    await sleep(1200);
    getElementById('card-remaining').style.opacity = '1';
    if (!hasDoneTuto) {
      await playPilePresentation();
    }
    for (let i = 0; i < this.hand.length; i++) {
      const card = this.cardById[this.hand[i]];
      card.pos = positions.hand(i);
      card.hidden = false;
      this.updateCard(card, 100);
      await sleep(DRAW_ANIMATION_MS);
    }
    await sleep(DRAW_ANIMATION_MS);

    if (!hasDoneTuto) {
      await playHandPresentation();
    }
    await this.refillBenediction();
    if (!hasDoneTuto) {
      await playBenedictionHandPresentation();
    }
    getElementById('instruction').style.opacity = '1';
    this.ready = true;
    localStorage.setItem('adb-tutorial', 'done');
    await sleep(DRAW_ANIMATION_MS);
    this.refreshInterface();
  }

  // Listener functions

  private onClickPile(): void {
    if (!this.ready) return;
    if (this.action !== ActionState.draw) return;
    this.drawPile();
  }

  private onClickBenediction(id: string): void {
    if (!this.ready) return;
    const card = this.cardById[id] as BenedictionCard;
    if (this.action === ActionState.draw || this.action === ActionState.playMalediction) {
      this.playBenediction(card);
    } else if (this.action === ActionState.choose) {
      this.chosenCardId = card.id;
    }
  }

  private onClickHandCard(card: TreasureCard): void {
    if (!this.ready || card.locked) return;
    const handIndex = this.hand.indexOf(card.id);
    if (this.action == ActionState.discard) {
      this.discardCardFrom(card, this.hand);
    }
    if ([ActionState.choose, ActionState.chooseTreasure].includes(this.action)) {
      this.chosenCardId = card.id;
    }
  }

  // Functionality functions

  private async chooseCard(state: ActionState): Promise<TreasureCard | BenedictionCard> {
    this.setActionState(state);
    await waitFor(() => !!this.chosenCardId);
    const chosenCard = this.cardById[this.chosenCardId as string] as TreasureCard | BenedictionCard;
    this.chosenCardId = undefined;
    return chosenCard;
  }

  private drawBenediction(): void {
    const index = this.benedictionHand.indexOf('empty');
    if (this.benedictionCredit === 0 || index === -1) {
      return;
    }
    this.addBenedictionCredit(-1);
    this.refreshCredits();
    const card = this.findBenedictionPile();
    this.benedictionHand.splice(index, 1, card.id);
    card.hidden = false;
    card.pos = positions.benedictionHand(index);
    this.updateCard(card, 1, () => this.onClickBenediction(card.id));

    const benedictionCard = getRandomBenediction(this.benedictionHand, this.cardById);
    benedictionCard.pos = positions.benedictionPile();
    this.cardById[benedictionCard.id] = benedictionCard;
    const cardEl = createDomCard(benedictionCard);
    this.boardEl.append(cardEl);
    this.updateCard(benedictionCard, 1, null);
  }

  private findCardIdOnPileWithCondition(condFn: (id: string) => boolean) {
    const index = this.pile.findLastIndex(condFn);
    if (index === -1) return;
    return this.pile.splice(index, 1)[0];
  }

  private async drawPile(options?: any, withFilter: Boolean = false, condFn?: (id: string) => boolean): Promise<void> {
    let cardId;
    if (withFilter) {
      let conditionFn = condFn;
      if (!conditionFn) {
        conditionFn = (id: string) => this.cardById[id] instanceof TreasureCard;
      }
      cardId = this.findCardIdOnPileWithCondition(conditionFn);
    }
    if (!cardId) {
      cardId = this.pile.pop();
    }
    if (!cardId) return;
    const card = this.cardById[cardId];
    card.inPile = false;
    if (card instanceof TreasureCard) {
      card.locked = options?.locked ?? false;
      card.hidden = options?.hidden ?? false;
      this.addCardToHand(card);
    } else if (card instanceof MaledictionCard) {
      card.hidden = false;
      this.displayMalediction(card);
    }
    this.refreshInterface();
    await sleep(800);
  }

  private addCardToHand(card: TreasureCard): void {
    card.pos = positions.hand(this.hand.length);
    this.hand.push(card.id);
    card.inDiscard = false;
    this.updateCard(card, 98, () => this.onClickHandCard(card));
    this.refreshInterface();
  }

  private discardCard(card: Card, addCredits: boolean = true): void {
    if (addCredits && card instanceof TreasureCard) {
      if (card.type === 'tb') {
        this.addBenedictionCredit();
      }
      if (card.val <= 0) {
        this.addBenedictionCredit();
      }
      this.refreshCredits();
    }

    this.discardedPile.push(card.id);
    card.hidden = true;
    card.locked = false;
    card.pos = positions.discard();
    if (card instanceof TreasureCard) {
      card.val = card.defaultVal;
    }
    card.inDiscard = true;
    this.updateCard(card, this.discardedPile.length + 1, null);
    this.refreshInterface();
  }

  private discardCardFrom(card: Card, from: string[], addCredits: boolean = true) {
    this.discardCard(card, addCredits);
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
    const effect = this.currentMalediction.effect;
    const randomHandIndex = getRandomIndex(this.hand);
    delete this.currentMalediction;

    switch (effect) {
      case 'past-weight':
        await this.drawPile({ hidden: true }, true);
        break;
      case 'growing-shadow':
        if (randomHandIndex === -1) break;
        const card = this.cardById[this.hand[randomHandIndex]] as TreasureCard;
        if (card) {
          card.val += 2;
          this.updateCard(card, 1);
          await this.playValueChangeAnimation(card.id);
        }
        break;
      case 'unavoidable-pain':
        await this.drawPile({ locked: true }, true);
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
        if (randomHandIndex === -1 || !this.hand[randomHandIndex]) break;
        this.discardCardFrom(this.cardById[this.hand[randomHandIndex]], this.hand, false);
        await this.drawPile({}, true);
        break;
      case 'destiny-fracture':
        if (randomHandIndex === -1) break;
        const fractureCard = this.cardById[this.hand[randomHandIndex]] as TreasureCard;
        if (!fractureCard) break;
        fractureCard.val = Math.floor(fractureCard.val / 2);
        this.updateCard(fractureCard, 1);
        await this.playValueChangeAnimation(fractureCard.id);
        if (fractureCard.val === 0) {
          this.discardCardFrom(fractureCard, this.hand, false);
          await this.drawPile();
        }
        break;
      case 'past-echo':
        if (dicardIndex === -1) break;
        const discardedCard = this.cardById[this.discardedPile[dicardIndex]] as TreasureCard;
        this.discardedPile.splice(dicardIndex, 1);
        discardedCard.hidden = false;
        this.addCardToHand(discardedCard);
        break;
    }
    this.refillBenediction();
    if (!this.currentMalediction) {
      this.setActionState(ActionState.draw);
    }
  }

  private async playBenediction(card: BenedictionCard): Promise<void> {
    if (card.effect === 'second-wind') return;

    const usableHandIds = this.hand.filter((id) => !this.cardById[id].locked);

    if (!['13th-talisman', 'future-vision'].includes(card.effect) && !usableHandIds.length) {
      return;
    }
    if (!['revelation', 'future-vision'].includes(card.effect)) {
      card.pos = positions.center();
      this.updateCard(card, 1, null);
    }
    switch (card.effect) {
      case 'evasion':
        const chosenEvadedCard = (await this.chooseCard(ActionState.chooseTreasure)) as TreasureCard;
        chosenEvadedCard.val = 0;
        this.updateCard(chosenEvadedCard, 1);
        await this.playValueChangeAnimation(chosenEvadedCard.id);
        this.discardCardFrom(chosenEvadedCard, this.hand);
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
          await this.drawPile({}, true, (id: string) => this.cardById[id].type === chosenCard.type);
        } else {
          this.addBenedictionCredit();
          this.drawBenediction();
        }
        break;
      case '13th-talisman':
        if (!this.currentMalediction) {
          this.addBenedictionCredit(2);
          break;
        }
        await this.playBenedictionUseAnimation(card);
        hideElement(this.maledictionEl);
        this.discardCard(this.currentMalediction);
        await sleep(DRAW_ANIMATION_MS);
        break;
      case 'future-vision':
        const cards = this.displayPilePreview();
        const chosenKeptCard = await this.chooseCard(ActionState.choosePreview);
        cards.forEach((card) => {
          if (card.id !== chosenKeptCard.id) {
            this.discardCard(card, false);
          }
        });

        if (chosenKeptCard instanceof TreasureCard) {
          this.addCardToHand(chosenKeptCard);
        } else {
          this.discardCardFrom(card, this.benedictionHand);
          await this.refillBenediction();
          await sleep(600);
          await this.displayMalediction(chosenKeptCard);
          return;
        }
        break;
    }
    this.discardCardFrom(card, this.benedictionHand);
    await this.refillBenediction();
    this.setActionState(ActionState.draw);
  }

  async refillBenediction() {
    this.drawBenediction();
    if (this.benedictionHand.indexOf('empty') !== -1 && this.benedictionCredit > 0) {
      await sleep(DRAW_ANIMATION_MS);
      this.drawBenediction();
      await sleep(DRAW_ANIMATION_MS);
    }
  }

  displayPilePreview(): Card[] {
    const spacing = cardWidth() + rem(1);
    const cards = this.pile.splice(-3).map((id) => {
      const card = this.cardById[id];
      card.pos = positions.center();
      card.hidden = false;
      return card;
    });
    if (cards.length === 2) {
      cards[0].pos.left -= spacing / 2;
      cards[1].pos.left += spacing / 2;
    } else if (cards.length === 3) {
      cards[0].pos.left -= spacing;
      cards[2].pos.left += spacing;
    }
    cards.forEach((card) =>
      this.updateCard(card, 99, () => {
        this.chosenCardId = card.id;
      }),
    );
    return cards;
  }

  // Visual functions

  public refreshAll() {
    this.ready = false;
    deathEl.style.transition = 'none';
    Object.keys(this.cardById).forEach((id) => (getElementById(id).style.transition = 'none'));
    this.pile.forEach((id, index) => {
      this.cardById[id].pos = positions.pile();
      this.updateCard(this.cardById[id], index + 1);
    });
    this.discardedPile.forEach((id, index) => {
      this.cardById[id].pos = positions.discard();
      this.updateCard(this.cardById[id], index + 1);
    });
    const benedictionPile = this.findBenedictionPile();
    benedictionPile.pos = positions.benedictionPile();
    this.updateCard(benedictionPile, 1);
    this.refreshInterface();
    this.refreshHand();
    this.refreshBenedictionHand();
    setTimeout(() => {
      deathEl.style.transition = 'all .8s linear';
      Object.keys(this.cardById).forEach(
        (id) => (getElementById(id).style.transition = 'top 0.8s,left 0.8s,transform 0.2s'),
      );
    }, 100);
    this.ready = true;
  }

  public refreshCredits() {
    const credits = getElementById('credits');
    credits.style.opacity = '1';
    for (let i = 0; i < 5; i++) {
      getElementById('c' + i).classList.toggle('active', this.benedictionCredit > i);
    }
  }

  public refreshInterface(): void {
    this.cardRemainingEl.innerText = this.pile.length.toString();

    let text = 'Draw or play a card';
    switch (this.action) {
      case ActionState.discard:
        text = `Discard 1 card`;
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
    this.indexEl.style.height = `${(100 / 13) * Math.max(13 - this.getSum(true), 0)}%`;
  }

  private async displayMalediction(card: MaledictionCard): Promise<void> {
    this.setActionState(ActionState.playMalediction);
    card.pos = positions.center();
    this.currentMalediction = card;
    this.updateCard(card, 99, null);
    displayElement(this.maledictionEl);
    const index = this.findBenedictionCardIndex('13th-talisman');
    if (index !== -1) {
      this.updateCard(this.cardById[this.benedictionHand[index]], 100);
    }
    await sleep(600);
  }

  private refreshHand(): void {
    this.hand.forEach((id, index) => {
      const card = this.cardById[id] as TreasureCard;
      card.pos = positions.hand(index);
      this.updateCard(card, 1);
    });
    this.refreshInterface();
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
    cardEl.style.width = `${cardWidth()}px`;
    cardEl.style.height = `${cardHeight()}px`;
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
    await sleep(600);
  }

  // Utility functions

  private addBenedictionCredit(nb: number = 1) {
    this.benedictionCredit = Math.max(Math.min(this.benedictionCredit + nb, 6), 0);
  }

  private findBenedictionPile() {
    return Object.values(this.cardById).find(
      (c) =>
        c instanceof BenedictionCard &&
        this.benedictionHand.indexOf(c.id) === -1 &&
        this.discardedPile.indexOf(c.id) === -1,
    ) as BenedictionCard;
  }

  public setActionState(state: ActionState, nbCard: number = 1): void {
    this.action = state;
    this.refreshInterface();
  }

  public getSum(noHidden: boolean = false): number {
    return this.hand.reduce((r, id: string) => {
      const card = this.cardById[id] as TreasureCard;
      return r + (noHidden && card.hidden ? 0 : card.val);
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
    this.ready = false;
    const card = this.cardById[this.benedictionHand[index]] as BenedictionCard;
    await this.playBenedictionUseAnimation(card);

    [...this.benedictionHand.filter(id => id !== 'empty'), ...this.hand].forEach((id) => {
      const card = this.cardById[id];
      this.discardCard(card);
    });
    this.resetBenediction();
    this.hand = [];
    this.benedictionCredit = 2;
    await sleep(800);
    await this.refillBenediction();
    this.ready = true;
  }
}
