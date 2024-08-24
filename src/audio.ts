const notes: { [key: string]: number } = {
  'C3': 130.81,
  'D3': 146.83,
  'E3': 164.81,
  'F3': 174.61,
  'G3': 196,
  'A3': 220,
  'B3': 246.94,
  'C4': 261.63,
  'D4': 293.6,
  'E4': 329.63,
  'F4': 349.23,
  'G4': 392,
  'A4': 440,
  'B4': 493.88,
  'C5': 523.25,
  'D5': 587.33,
  'E5': 659.25,
  'F5': 698.46,
  'G5': 783.99,
  'A5': 880,
  'B5': 987.77,
};
const BPM = 120;
export const loopLength = (4 * 60000) / BPM;

export const chords = {
  name: 'bg-chord',
  notes: [
    ['E4:4', 'C4:4', 'G3:4'],
    ['D4:4', 'B3:4', 'F3:4'],
    ['F4:4', 'C4:4', 'A3:4'],
    ['E4:4', 'B3:4', 'G3:4'],

    ['E4:4', 'C4:4', 'G3:4'],
    ['G4:4', 'E4:4', 'B3:4'],
    ['F4:4', 'C4:4', 'A3:4'],
    ['D4:4', 'B3:4', 'F3:4'],
  ]
};

export const melody = {
  name: 'bg-melody',
  notes: [
    ['A4:1', 'B4:1:1', 'C5:1:2', 'B4:1:3'],
    ['A4:3', 'B4:1:3'],
    ['A4:3', 'F4:1:3'],
    ['G4:2', 'E4:3:2'],
    ['A4:1:1', 'B4:1:2', 'C5:1:3'],
    ['D5:3', 'C5:1:3'],
    ['B4:3', 'C5:1:3'],
    ['B4:2', 'A4:3:2'],
    ['B4:1:1', 'C5:1:2', 'D5:1:3'],
    ['E5:3', 'D5:1:3'],
    ['C5:3', 'D5:1:3'],
    ['C5:2', 'B4:3:2'],
    ['G4:1:1', 'A4:1:2', 'B4:1:3'],
    ['A4:3', 'F4:1:3'],
    ['G4:3', 'A4:1:3'],
    ['G4:2', 'A4:2:2'],
  ]
};

const MAIN_VOLUME = 0.02;
let aCtx: AudioContext;
let audioInst: Audio;
let interval: NodeJS.Timeout;


interface Melody {
  name: string,
  notes: string[][],
}


interface SynthConfig {
  objects: string,
  connections: string,
}

interface Synth {
  oscillator: OscillatorNode[],
  gains: GainNode[],
  filters: BiquadFilterNode[]
};

const synthConfig = {
  objects: 'o:sine,o:triangle,g,f:lowshelf:180:-18,f:highshelf:677:-6.2,f:highshelf:3157:-6.8',
  connections: 'o0-g0,o1-g0,g0-f0,f0-f1,f1-f2,f2-a'
}

export default class Audio {
  i = 0;
  iterators: { [id: string]: number } = {};
  intervals: { [id: string]: NodeJS.Timeout } = {};

  initAudioContext() {
    aCtx = new AudioContext();
  }

  playTS() {
    const synthConfig = {
      objects: 'o:sine,g,f:highpass:190,f:notch:1223,f:lowshelf:1870:-10.5',
      connections: 'o0-g0,g0-f0,f0-f1,f1-f2,f2-a'
    }
    this.playNote(synthConfig, aCtx.currentTime, notes.D4, 0.1, 0.1);
  }

  createSynth(synthConfig: SynthConfig): Synth {
    const synth: Synth = {
      oscillator: [],
      gains: [],
      filters: []
    }
    synthConfig.objects.split(',').forEach((conf) => {
      const [obj, type, frequency, gain] = conf.split(':');
      if (obj === 'o') {
        synth.oscillator.push(new OscillatorNode(aCtx, { type: type as OscillatorType }))
      } else if (obj === 'g') {
        synth.gains.push(aCtx.createGain());
      } else if (obj === 'f') {
        synth.filters.push(new BiquadFilterNode(aCtx, {
          type: type as BiquadFilterType,
          frequency: parseInt(frequency),
          gain: gain ? parseFloat(gain) : undefined,
        }));
      }
    });
    synthConfig.connections.split(',').forEach((conf) => {
      const [from, to] = conf.split('-');
      const match: any = { 'o': synth.oscillator, 'g': synth.gains, 'f': synth.filters };
      const fromNode = match[from[0]][parseInt(from[1])];
      const toNode = to === 'a' ? aCtx.destination : match[to[0]][parseInt(to[1])];
      fromNode.connect(toNode);
    });
    return synth;
  }

  playNote(synthConfig: SynthConfig, time: number, frequency: number, duration: number, volume = MAIN_VOLUME): void {
    const synth = this.createSynth(synthConfig);
    synth.gains.forEach(g => {
      g.gain.cancelScheduledValues(time);
      g.gain.setValueAtTime(0, time);
      g.gain.linearRampToValueAtTime(volume, time + 0.008);
      g.gain.linearRampToValueAtTime(volume, time + duration - 0.016);
      g.gain.linearRampToValueAtTime(0, time + duration - 0.008);
    });
    synth.oscillator.forEach(osc => {
      osc.frequency.setValueAtTime(frequency, time);
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  playMelody(synthConfig: SynthConfig, melody: Melody) {
    if (!this.iterators[melody.name]) {
      this.iterators[melody.name] = 0;
    }
    if (this.iterators[melody.name] === melody.notes.length) {
      this.iterators[melody.name] = 0;
    }
    melody.notes[this.iterators[melody.name]].forEach((note: string) => {
      const noteInfo = note.split(':');
      const n = noteInfo[0];
      const duration = parseInt(noteInfo[1]);
      const delay = noteInfo[2] ? parseInt(noteInfo[2]) : 0;
      this.playNote(
        synthConfig,
        aCtx.currentTime + (delay * 60) / BPM,
        notes[n],
        (duration * 60) / BPM
      );
    });
    this.iterators[melody.name]++;
  }

  playBgMusic(melody: Melody) {
    this.iterators[melody.name] = 0;
    this.playMelody(synthConfig, melody);
    this.intervals[melody.name] = setInterval(() => this.playMelody(synthConfig, melody), loopLength);
  }

  stopBgMusic() {
    Object.values(this.intervals).forEach(clearInterval);
  }

  static getInstance() {
    if (audioInst == null) {
      audioInst = new Audio();
    }
    return audioInst;
  }
}