import { BenedictionCard, Card, createDomCard, positions, MaledictionCard, TreasureCard, updateCard } from './cards';
import { shuffleArray, waitFor, displayElement, hideElement } from './utils';
import { getMaledictionCards, getRandomBenediction, getTreasureCards } from './config';

export enum ActionState {
  discard,
  draw,
  choose,
  chooseTreasure,
}

export default class GameState {
  cards: Card[] = [];
  pile: string[];
  hand: string[];
  benedictionHand: string[] = ['empty', 'empty', 'empty'];
  discardedPile: string[] = [];
  action: ActionState;
  nbCardToAction: number = 0;
  currentMalediction?: MaledictionCard;
  chosenCardId?: string;

  private gameEl = document.getElementById('game') as HTMLElement;
  private cardLeftEl = document.querySelector('#card-left span') as HTMLElement;
  private instructionEl = document.getElementById('instruction') as HTMLElement;
  private maledictionEl = document.getElementById('malediction') as HTMLElement;

  constructor() {
    this.cards.push(...getTreasureCards());
    shuffleArray(this.cards);
    this.hand = this.cards.slice(this.cards.length - 5).map((card, index) => {
      card.pos = positions.hand(index);
      card.hidden = false;
      return card.id;
    });
    this.cards.push(...getMaledictionCards());
    this.pile = this.cards.filter((c) => !this.hand.includes(c.id)).map(({ id }) => id);
    shuffleArray(this.pile);
    const benediction = getRandomBenediction();
    benediction.pos = positions.benedictionPile();
    this.cards.push(benediction);
    this.initCardsVisuals();
  }

  initCardsVisuals(): void {
    this.cards.forEach((card) => {
      const handIndex = this.hand.indexOf(card.id);
      const pileIndex = this.pile.indexOf(card.id);
      const cardEl = createDomCard(card, card.id);

      let listener;
      if (handIndex !== -1) {
        listener = () => this.clickHandCard(card as TreasureCard);
      }
      if (pileIndex === this.pile.length - 1) {
        listener = () => this.clickPile();
      }
      if (card instanceof BenedictionCard) {
        listener = () => this.clickBenedictionPile();
      }
      this.gameEl.appendChild(cardEl);
      updateCard(this.gameEl, card, pileIndex !== -1 ? pileIndex : 1, listener);
    });
  }

  refresh(): void {
    this.cardLeftEl.innerText = this.pile.length.toString();
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

  findCardById(cardId: string): Card | undefined {
    return this.cards.find(({ id }) => id === cardId);
  }

  discardCard(card: Card): void {
    // remove listene of old top discard card
    updateCard(this.gameEl, this.findCardById(this.discardedPile[this.discardedPile.length - 1]), 1);

    this.discardedPile.push(card.id);
    card.hidden = true;
    card.pos = positions.discard();
    console.log(card, card.pos);
    updateCard(this.gameEl, card, this.discardedPile.length + 1, () => {
      console.log('discard click', card.id);
    });
    if (this.action == ActionState.discard) {
      this.nbCardToAction--;
    }
    this.refresh();
  }

  clickBenediction(id: string): void {
    const card = this.findCardById(id) as BenedictionCard;
    if (this.action === ActionState.draw) {
      this.playBenediction(card);
    } else if (this.action === ActionState.choose) {
      this.chosenCardId = card.id;
      this.nbCardToAction--;
    }
  }

  clickBenedictionPile(): void {
    if (this.action !== ActionState.draw) return;
    this.drawBenediction();
  }

  drawBenediction(): void {
    const card = this.cards.find(
      (c) =>
        c instanceof BenedictionCard &&
        this.benedictionHand.indexOf(c.id) === -1 &&
        this.discardedPile.indexOf(c.id) === -1,
    ) as BenedictionCard;
    const index = this.benedictionHand.indexOf('empty');
    if (index === -1) {
      // maybe play animation
      return;
    }
    this.benedictionHand.splice(index, 1, card.id);
    card.hidden = false;
    card.pos = positions.benedictionHand(index);
    updateCard(this.gameEl, card, 1, () => this.clickBenediction(card.id));

    const benedictionCard = getRandomBenediction();
    benedictionCard.pos = positions.benedictionPile();
    this.cards.push(benedictionCard);
    const cardEl = createDomCard(benedictionCard, benedictionCard.id);
    this.gameEl.append(cardEl);
    updateCard(this.gameEl, benedictionCard, 1, () => this.clickBenedictionPile());
  }

  clickPile(): void {
    if (this.action !== ActionState.draw) return;
    this.drawPile();
  }

  drawPile(onlyTreasure: boolean = false): void {
    let cardId;
    if (onlyTreasure) {
      const index = this.pile.findLastIndex((id) => this.findCardById(id) instanceof TreasureCard);
      cardId = this.pile.splice(index, 1)[0];
    } else {
      cardId = this.pile.pop();
      if (!cardId) return;
    }
    const card = this.findCardById(cardId) as Card;
    card.hidden = false;
    if (card instanceof TreasureCard) {
      card.pos = positions.hand(this.hand.length);
      this.hand.push(card.id);
      updateCard(this.gameEl, card, 1, () => this.clickHandCard(card));
    } else if (card instanceof MaledictionCard) {
      card.pos = positions.malediction();
      this.currentMalediction = card;
      updateCard(this.gameEl, card, 100);
      displayElement(this.maledictionEl);
    }
    const pileTop = this.cards.find(({ id }) => id === this.pile[this.pile.length - 1]);
    if (pileTop) {
      updateCard(this.gameEl, pileTop, this.pile.length, () => this.clickPile());
    }
  }

  clickHandCard(card: TreasureCard): void {
    const handIndex = this.hand.indexOf(card.id);
    if (this.action == ActionState.discard) {
      this.hand.splice(handIndex, 1);
      this.discardCard(card);
      this.refreshHand();
    }
    if ([ActionState.choose, ActionState.chooseTreasure].includes(this.action)) {
      this.chosenCardId = card.id;
      this.nbCardToAction--;
    }
  }

  refreshHand(): void {
    this.hand.forEach((id, index) => {
      const card = this.findCardById(id) as TreasureCard;
      card.pos = positions.hand(index);
      updateCard(this.gameEl, card, 1, undefined, false);
    });
  }

  setActionState(state: ActionState, nbCard: number = 1): void {
    this.nbCardToAction = nbCard;
    this.action = state;
    this.refresh();
  }

  getSum(): number {
    return this.hand.reduce((r, id: string) => {
      const card = this.cards.find((c) => c.id === id) as TreasureCard;
      return r + card.val;
    }, 0);
  }

  playMalediction(): void {
    if (!this.currentMalediction) return;
    this.discardCard(this.currentMalediction);
    hideElement(this.maledictionEl);
    console.log('play malediction');
    // switch (this.currentMalediction.effect) {
    //       case 'past-weight':
    //         const treasureCard = pickCard(this, 't');
    //         if (treasureCard) {
    //           treasureCard.hidden = true;
    //           this.hand.push(treasureCard);
    //         }
    //         break;
    //       case 'growing-shadow':
    //         if (treasureIndex !== -1) {
    //           (this.hand[treasureIndex] as TreasureCard).val += 2;
    //         }
    //         break;
    //       case 'unavoidable-pain':
    //         this.nextTreasureModifier = (c: TreasureCard) => {
    //           c.canBeDiscarded = false;
    //           this.nextTreasureModifier = undefined;
    //         };
    //         break;
    //       case 'poison-trasure':
    //         // TODO
    //         break;
    //       case '13th-rage':
    //         this.hand.forEach((c) => {
    //           if (c instanceof TreasureCard && c.val === 3) {
    //             c.val += 1;
    //           }
    //         });
    //         break;
    //       case 'false-hope':
    //         this.discardCard(getRandomIndex(this.hand));
    //         const card = pickCard(this);
    //         if (card) {
    //           this.hand.push(card);
    //         }
    //         break;
    //       case 'god-faith':
    //         // TODO
    //         break;
    //       case 'destiny-fracture':
    //         if (treasureIndex !== -1) {
    //           const treasure = this.hand[treasureIndex] as TreasureCard;
    //           treasure.val = Math.floor(treasure.val / 2);
    //           if (treasure.val === 0) {
    //             this.discardCard(treasureIndex);
    //             const card = pickCard(this);
    //             if (card) {
    //               this.hand.push(card);
    //             }
    //           }
    //         }
    //         break;
    //       case 'past-echo':
    //         const discardedCard = this.discard.slice(Math.floor(Math.random() * this.discard.length))[0];
    //         if (discardedCard) {
    //           this.hand.push(discardedCard);
    //         }
    //         break;
    //       case 'quicksand':
    //         this.activeMaledictions.push(this.currentMalediction);
    //         break;
    //     }
  }

  async chooseCard(state: ActionState): Promise<TreasureCard | BenedictionCard> {
    this.setActionState(state);
    await waitFor(() => {
      return this.nbCardToAction === 0;
    });
    const chosenCard = this.findCardById(this.chosenCardId as string) as TreasureCard | BenedictionCard;
    this.chosenCardId = undefined;
    return chosenCard;
  }

  async playBenediction(card: BenedictionCard): Promise<void> {
    this.discardCard(card);
    const index = this.benedictionHand.indexOf(card.id);
    this.benedictionHand.splice(index, 1, 'empty');
    let chosenCard;
    switch (card.effect) {
      case 'evasion':
        this.setActionState(ActionState.discard);
        await waitFor(() => this.nbCardToAction === 0);
        this.setActionState(ActionState.draw);
        break;
      case 'protection':
        chosenCard = (await this.chooseCard(ActionState.chooseTreasure)) as TreasureCard;
        if (chosenCard.val === 0) {
          this.discardCard(chosenCard);
          this.hand.splice(this.hand.indexOf(chosenCard.id), 1);
          this.refreshHand();
        } else {
          updateCard(this.gameEl, chosenCard, 1, undefined, false);
        }
        break;
      case 'lucky-switch':
        chosenCard = await this.chooseCard(ActionState.choose);
        this.discardCard(chosenCard);
        if (chosenCard instanceof TreasureCard) {
          this.hand.splice(this.hand.indexOf(chosenCard.id));
          this.refreshHand();
        } else {
          this.benedictionHand.splice(this.benedictionHand.indexOf(chosenCard.id), 1, 'empty');
        }
        if (chosenCard instanceof BenedictionCard) {
          this.drawBenediction();
        } else {
          this.drawPile(true);
        }
        break;
      /* case 'future-vision':
        const previewCards = pickCards(this, 3);
        this.showPreview(previewCards);
        this.setActionState(ActionState.choose);
        waitFor(() => this.chosenCard !== -1);
        this.hand.push(previewCards.splice(this.chosenCard, 1)[0]);
        this.discard.push(...previewCards);
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
        break;*/
    }
    this.setActionState(ActionState.draw);
  }
}
