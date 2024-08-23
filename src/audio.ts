const notes: { [key: string]: number } = {
  C4: 261.63,
  D4: 293.6,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
};
const BPM = 120;
const melody = [
  ['F4:4', 'A4:4', 'C5:4', 'C4:1', 'D4:1:1', 'E4:1:2', 'F4:1:3'],
  ['E4:4', 'G4:4', 'B4:4'],
  ['D4:4', 'F4:4', 'A4:4'],
  ['E4:4', 'G4:4', 'B4:4'],
  ['F4:4', 'A4:4', 'C5:4', 'C4:1', 'D4:1:1', 'E4:1:2', 'F4:1:3'],
  ['E4:4', 'G4:4', 'B4:4'],
  ['D4:4', 'F4:4', 'A4:4'],
  ['C4:4', 'F4:4', 'A4:4'],
];

const MAIN_VOLUME = 0.05;
let aCtx: AudioContext;
let audioInst: Audio;
let interval: NodeJS.Timeout;

export function initAudioContext() {
  aCtx = new AudioContext();
}

export default class Audio {
  i = 0;

  playTS() {
    this.playNote(aCtx, aCtx.currentTime, notes.D4, 0.1, 0.1);
  }

  playNote(aCtx: AudioContext, time: number, frequency: number, duration: number, volume = MAIN_VOLUME) {
    const osc = new OscillatorNode(aCtx, {
      frequency,
      type: 'sine',
    });
    let filter1 = new BiquadFilterNode(aCtx, {
      type: 'highpass',
      frequency: 190,
    });
    let filter2 = new BiquadFilterNode(aCtx, {
      type: 'notch',
      frequency: 1223,
    });
    let filter3 = new BiquadFilterNode(aCtx, {
      type: 'lowshelf',
      frequency: 1870,
      gain: -10.5,
    });
    const g = aCtx.createGain();
    g.gain.cancelScheduledValues(time);
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(volume, time + 0.008);
    g.gain.linearRampToValueAtTime(0, time + duration - 0.008);
    osc.connect(g);
    g.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(filter3);
    filter3.connect(aCtx.destination);
    osc.start(time);
    osc.stop(time + duration);
    return osc;
  }

  playMelody(aCtx: AudioContext) {
    if (this.i === melody.length) {
      this.i = 0;
    }
    melody[this.i].forEach((note: string) => {
      const noteInfo = note.split(':');
      const n = noteInfo[0];
      const duration = parseInt(noteInfo[1]);
      const delay = noteInfo[2] ? parseInt(noteInfo[2]) : 0;
      this.playNote(
        aCtx,
        aCtx.currentTime + (delay * 60) / BPM,
        notes[n],
        (duration * 60) / BPM
      );
    });
    this.i++;
  }

  playBgMusic() {
    this.playMelody(aCtx);
    interval = setInterval(() => this.playMelody(aCtx), (4 * 60000) / BPM);
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