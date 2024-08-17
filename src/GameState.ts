import { BenedictionCard, Card, createDomCard, positions, MaledictionCard, TreasureCard } from './cards';
import { shuffleArray, waitFor, displayElement, hideElement, getRandomIndex } from './utils';
import { getMaledictionCards, getRandomBenediction, getTreasureCards } from './config';

export enum ActionState {
  discard,
  draw,
  choose,
  chooseTreasure,
}

export default class GameState {
  cards: Card[];
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
  private cardLeftEl = document.querySelector('#card-left span') as HTMLElement;
  private instructionEl = document.getElementById('instruction') as HTMLElement;
  private maledictionEl = document.getElementById('malediction') as HTMLElement;

  constructor() {
    this.benedictionHand = ['empty', 'empty', 'empty'];
    this.discardedPile = [];
    this.chosenCardId = undefined;
    this.activeMaledictions = [];
    this.cards = getTreasureCards();
    shuffleArray(this.cards);
    this.hand = this.cards.slice(this.cards.length - 5).map((card, index) => {
      card.pos = positions.hand(index);
      card.hidden = false;
      return card.id;
    });
    this.cards.push(...getMaledictionCards());
    this.pile = this.cards.filter((c) => !this.hand.includes(c.id)).map(({ id }) => id);
    shuffleArray(this.pile);
    // debug
    // const magicCard = new MaledictionCard(
    //   'Debug Malediction',
    //   'Play\'s whatever the dev programmed',
    //   'destiny-fracture',
    // );
    // this.cards.push(magicCard);
    // this.pile.push(magicCard.id);

    // debug
    const benediction = getRandomBenediction();
    benediction.pos = positions.benedictionPile();
    this.cards.push(benediction);
    this.initCardsVisuals();
    // TODO: de-uglify
    this.drawBenediction();
    this.drawBenediction();
    this.drawBenediction();
  }

  private initCardsVisuals(): void {
    this.cards.forEach((card) => {
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
      if (card instanceof BenedictionCard) {
        listener = () => this.onClickBenedictionPile();
      }
      this.boardEl.appendChild(cardEl);
      this.updateCard(card, pileIndex !== -1 ? pileIndex : 1, true, listener);
    });
  }

  // Listener functions

  private onClickPile(): void {
    if (this.action !== ActionState.draw) return;
    this.drawPile();
  }

  private onClickBenedictionPile(): void {
    if (this.action !== ActionState.draw) return;
    this.drawBenediction();
  }

  private onClickBenediction(id: string): void {
    const card = this.findCardById(id) as BenedictionCard;
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
      this.hand.splice(handIndex, 1);
      this.discardCard(card);
      this.refreshHand();
    }
    if ([ActionState.choose, ActionState.chooseTreasure].includes(this.action)) {
      this.chosenCardId = card.id;
      this.nbCardToAction--;
    }
  }

  // Visual functions

  public refresh(): void {
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

  private displayMalediction(card: MaledictionCard): void {
    card.pos = positions.malediction();
    this.currentMalediction = card;
    this.updateCard(card, 100);
    displayElement(this.maledictionEl);
  }

  private refreshHand(): void {
    this.hand.forEach((id, index) => {
      const card = this.findCardById(id) as TreasureCard;
      card.pos = positions.hand(index);
      this.updateCard(card, 1, false);
    });
  }

  private updateCard(card: Card, zIndex: number = 1, resetListener: boolean = true, listener?: any): void {
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
  }

  // Functionality functions

  private async chooseCard(state: ActionState): Promise<TreasureCard | BenedictionCard> {
    this.setActionState(state);
    await waitFor(() => {
      return this.nbCardToAction === 0;
    });
    const chosenCard = this.findCardById(this.chosenCardId as string) as TreasureCard | BenedictionCard;
    this.chosenCardId = undefined;
    return chosenCard;
  }

  private drawBenediction(): void {
    const card = this.cards.find(
      (c) =>
        c instanceof BenedictionCard &&
        this.benedictionHand.indexOf(c.id) === -1 &&
        this.discardedPile.indexOf(c.id) === -1,
    ) as BenedictionCard;
    const index = this.benedictionHand.indexOf('empty');
    if (index === -1) {
      // TODO: play benediction pile full animation
      return;
    }
    this.benedictionHand.splice(index, 1, card.id);
    card.hidden = false;
    card.pos = positions.benedictionHand(index);
    this.updateCard(card, 1, true, () => this.onClickBenediction(card.id));

    const benedictionCard = getRandomBenediction();
    benedictionCard.pos = positions.benedictionPile();
    this.cards.push(benedictionCard);
    const cardEl = createDomCard(benedictionCard, benedictionCard.id);
    this.boardEl.append(cardEl);
    this.updateCard(benedictionCard, 1, true, () => this.onClickBenedictionPile());
  }

  private drawPile(onlyTreasure: boolean = false, options?: any): void {
    let cardId;
    if (onlyTreasure) {
      const index = this.pile.findLastIndex((id) => this.findCardById(id) instanceof TreasureCard);
      cardId = this.pile.splice(index, 1)[0];
    } else {
      cardId = this.pile.pop();
      if (!cardId) return;
    }
    const card = this.findCardById(cardId) as Card;
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
    const pileTop = this.cards.find(({ id }) => id === this.pile[this.pile.length - 1]);
    if (pileTop) {
      this.updateCard(pileTop, this.pile.length, true, () => this.onClickPile());
    }
  }

  private discardCard(card: Card): void {
    // remove old top discard card listener
    const previousTopPile = this.findCardById(this.discardedPile[this.discardedPile.length - 1]);
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
    this.refresh();
  }

  public playMalediction(): void {
    const index = this.hasBenedictionCard('second-breath');
    if (!this.currentMalediction) return;
    const dicardIndex = getRandomIndex(this.discardedPile);

    this.discardCard(this.currentMalediction);
    hideElement(this.maledictionEl);
    if (index !== -1) {
      // TODO: play benediction break animation
      this.discardCard(this.findCardById(this.benedictionHand[index]) as Card);
      this.benedictionHand.splice(index, 1, 'empty');
    } else {
      const handIndex = getRandomIndex(this.hand);

      switch (this.currentMalediction.effect) {
        case 'past-weight':
          this.drawPile(true, { hidden: true });
          break;
        case 'growing-shadow':
          if (handIndex === -1) return;
          const card = this.findCardById(this.hand[handIndex]) as TreasureCard;
          card.val += 2;
          // TODO: play value change animation
          this.updateCard(card, 1, false);
          break;
        case 'unavoidable-pain':
          this.drawPile(true, { canBeDiscarded: false });
          break;
        case 'poison-trasure':
          // TODO : maybe
          break;
        case '13th-rage':
          this.hand.forEach((id) => {
            const card = this.findCardById(id) as TreasureCard;
            if (card.val === 3) {
              card.val += 1;
            }
          });
          this.refreshHand();
          break;
        case 'false-hope':
          if (handIndex === -1) return;
          this.discardCard(this.findCardById(this.hand[handIndex]) as TreasureCard);
          this.hand.splice(handIndex, 1);
          this.refreshHand();
          this.drawPile();
          break;
        case 'god-faith':
          // TODO: implement preview mode
          break;
        case 'destiny-fracture':
          if (handIndex === -1) return;
          const fractureCard = this.findCardById(this.hand[handIndex]) as TreasureCard;
          fractureCard.val = Math.floor(fractureCard.val / 2);
          // TODO: play value change animation
          this.updateCard(fractureCard, 1, false);
          if (fractureCard.val === 0) {
            this.discardCard(fractureCard);
            this.hand.splice(handIndex, 1);
            this.refreshHand();
            this.drawPile();
          }
          break;
        case 'past-echo':
          if (dicardIndex === -1) return;
          const discardedCard = this.findCardById(this.discardedPile[dicardIndex]) as Card;
          this.discardedPile.splice(dicardIndex, 1);
          discardedCard.hidden = false;
          if (discardedCard instanceof TreasureCard) {
            discardedCard.pos = positions.hand(this.hand.length);
            this.hand.push(discardedCard.id);
            this.updateCard(discardedCard, 1, true, () => this.onClickHandCard(card));
          } else if (discardedCard instanceof BenedictionCard) {
            const benedictionIndex = this.benedictionHand.indexOf('empty');
            if (benedictionIndex === -1) {
              // TODO: play benediction pile full animation
              return;
            }
            this.benedictionHand.splice(benedictionIndex, 1, discardedCard.id);
            discardedCard.pos = positions.benedictionHand(benedictionIndex);
            this.updateCard(discardedCard, 1, true, () => this.onClickBenediction(card.id));
          } else {
            this.displayMalediction(discardedCard);
            this.playMalediction();
          }
          break;
        case 'quicksand':
          // TODO : maybe not really usefull nor a malediction
          break;
      }
    }
    this.setActionState(ActionState.draw);
    this.nbCardToAction--;
  }

  private async playBenediction(card: BenedictionCard): Promise<void> {
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
          this.updateCard(chosenCard, 1, false);
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
        const card = this.cards.find((c) => this.hand.includes(c.id) && c.hidden);
        if (card) {
          card.hidden = false;
          this.updateCard(card, 1, false);
        }
        break;
    }
    this.setActionState(ActionState.draw);
  }

  // Utility functions

  private findCardById(cardId: string): Card | undefined {
    return this.cards.find(({ id }) => id === cardId);
  }

  public setActionState(state: ActionState, nbCard: number = 1): void {
    this.nbCardToAction = nbCard;
    this.action = state;
    this.refresh();
  }

  public getSum(): number {
    return this.hand.reduce((r, id: string) => {
      const card = this.findCardById(id) as TreasureCard;
      return r + card.val;
    }, 0);
  }

  private hasBenedictionCard(effect: string): number {
    return this.benedictionHand.findIndex((id) => {
      const card = this.findCardById(id) as BenedictionCard;
      return card && card.effect === effect;
    });
  }

  public activateLastChance(): void {
    if (!this.hasBenedictionCard('13th-talisman')) return;
    // TODO: play benediction break animation
    [...this.benedictionHand, ...this.hand].forEach((id) => {
      const card = this.findCardById(id) as Card;
      this.discardCard(card);
    });
    this.benedictionHand = [];
    this.hand = [];
  }
}
