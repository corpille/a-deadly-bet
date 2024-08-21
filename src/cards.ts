import { cardHeight, cardWidth, benedictions, positions, maledictions } from './config';

let id = 0;

export class BaseCard {
  id: string;
  type: string;
  hidden: boolean = true;
  listener?: any;
  posFn: any = positions.pile();
  pos: { top: number; left: number } = positions.pile();
  locked: boolean = false;
  inPile: boolean = false;
  inDiscard: boolean = false;

  constructor(type: string) {
    this.type = type;
    this.id = `${this.type}-${id++}`;
  }
}

export class TreasureCard extends BaseCard {
  val: number;
  defaultVal: number;
  constructor(val: number) {
    super('t');
    this.val = val;
    this.defaultVal = val;
  }
}

export class MaledictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;

  constructor(options: { name: string; desc: string; effect: string }) {
    super('m');
    this.name = options.name;
    this.desc = options.desc;
    this.effect = options.effect;
  }
}

export class BenedictionCard extends BaseCard {
  name: string;
  desc: string;
  effect: string;
  val?: number;

  constructor(options: { name: string; desc: string; effect: string; val?: number }) {
    super('b');
    this.name = options.name;
    this.desc = options.desc;
    this.effect = options.effect;
    this.val = options.val;
  }
}

export type Card = TreasureCard | MaledictionCard | BenedictionCard;

export function createDomCard(card: Card, id: string): HTMLElement {
  const cardEl = document.createElement('div') as HTMLElement;
  cardEl.classList.add('card', card.type);
  if (!card.locked) {
    cardEl.classList.add('locked');
  }
  cardEl.setAttribute('data-id', id);
  cardEl.style.height = `${cardHeight()}px`;
  cardEl.style.width = `${cardWidth()}px`;
  const cardInnerEl = document.createElement('div') as HTMLElement;
  cardInnerEl.classList.add('inner');
  const cardBackEl = document.createElement('div') as HTMLElement;
  cardBackEl.classList.add('back');
  const cardFrontEl = document.createElement('div') as HTMLElement;
  cardFrontEl.classList.add('front');

  const label = document.createElement('label') as HTMLElement;
  label.innerText = card instanceof TreasureCard ? 'Treasure' : card.name;

  const desc = document.createElement('p') as HTMLElement;
  desc.innerText = card instanceof TreasureCard ? card.val.toString() : card.desc;

  cardFrontEl.append(label);
  cardFrontEl.append(desc);
  cardInnerEl.append(cardFrontEl);
  cardInnerEl.append(cardBackEl);

  cardEl.append(cardInnerEl);
  return cardEl;
}

export function getMaledictionCards(): MaledictionCard[] {
  return maledictions.map((params) => new MaledictionCard(params));
}

function calculateCumulativeWeights(arr: any[]): number[] {
  return arr.reduce((r: number[], benediction): any => {
    const v = (r.length ? r[r.length - 1] : 0) + benediction.weight;
    r.push(v);
    return r;
  }, []);
}

function getWeightedRandomBenediction(availableBenedictions: any[]): BenedictionCard {
  const cumlativeWeight = calculateCumulativeWeights(availableBenedictions);
  const val = Math.floor(Math.random() * cumlativeWeight[cumlativeWeight.length - 1]);
  const index = cumlativeWeight.findIndex((v) => v >= val);
  return new BenedictionCard(availableBenedictions[index]);
}

export function getRandomBenediction(benedictionHand: string[], cardByid: { [id: string]: Card }): BenedictionCard {
  const benedictionHandEffect = benedictionHand
    .filter((v) => v !== 'empty')
    .map((id) => (cardByid[id] as BenedictionCard).effect);
  const availableBenediction = benedictions.filter(({ effect }) => !benedictionHandEffect.includes(effect));
  console.log(availableBenediction.map((e) => e.effect));
  return getWeightedRandomBenediction(availableBenediction);
}

export function getTreasureCards(): Array<TreasureCard> {
  const availableCards: Array<TreasureCard> = [];
  for (let i = 0; i < 4; i++) {
    // nb set
    for (let j = 0; j < 7; j++) {
      // max value
      availableCards.push(new TreasureCard(j + 1));
    }
  }
  return availableCards;
}
