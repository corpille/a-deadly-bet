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
const melody = [
  ['C4:4', 'A3:4', 'E4:1', 'F4:1:1', 'A4:1:2', 'G4:1:3'],
  ['B3:4', 'F3:4', 'D4:2', 'G4:2:2'],
  ['C4:4', 'G3:4', 'E4:1', 'F4:1:1', 'G4:1:2', 'F4:1:3'],
  ['A3:4', 'E3:4', 'C4:2', 'G3:2:2'],
  ['C4:4', 'A3:4', 'E4:1', 'D4:1:1', 'B3:1:2', 'F4:1:3'],
  ['B3:4', 'F3:4', 'D4:2', 'C4:2:2'],
  ['D4:4', 'G3:4', 'E4:1', 'C4:1:1', 'F4:1:2', 'B3:1:3'],
  ['A3:4', 'E3:4', 'C4:2', 'G3:2:2'],
];

const MAIN_VOLUME = 0.006;
let aCtx: AudioContext;
let audioInst: Audio;
let interval: NodeJS.Timeout;

interface SynthConfig {
  objects: string,
  connections: string,
}

interface Synth {
  oscillator: OscillatorNode[],
  gains: GainNode[],
  filters: BiquadFilterNode[]
};

export default class Audio {
  i = 0;
  synth: Synth;

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
      g.gain.linearRampToValueAtTime(volume, time + duration - 0.008);
      g.gain.linearRampToValueAtTime(0, time + duration - 0.004);
    });
    synth.oscillator.forEach(osc => {
      osc.frequency.setValueAtTime(frequency, time);
      osc.start(time);
      osc.stop(time + duration);
    });
  }

  playMelody(synthConfig: SynthConfig) {
    if (this.i === melody.length) {
      this.i = 0;
    }
    melody[this.i].forEach((note: string) => {
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
    this.i++;
  }

  playBgMusic() {
    const synthConfig = {
      objects: 'o:sine,o:sawtooth,g,f:highpass:190,f:notch:6429,f:highshelf:2533:-24',
      connections: 'o0-g0,o1-g0,g0-f0,f0-f1,f1-f2,f2-a'
    }
    this.playMelody(synthConfig);
    interval = setInterval(() => this.playMelody(synthConfig), (4 * 60000) / BPM);
  }

  stopBgMusic() {
    if (interval) {
      clearInterval(interval);
    }
  }

  static getInstance() {
    if (audioInst == null) {
      audioInst = new Audio();
    }
    return audioInst;
  }
}