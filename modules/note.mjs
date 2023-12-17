export class Notes {
  all;

  static {
    Notes.symbols = 'C C♯ D D♯ E F F♯ G G♯ A B♭ B'.split(' ');
    Notes.natural = Notes.symbols.filter((s) => s.length == 1);
  }

  constructor() {
    this.all = [];
    for (let i = 0; i < Notes.symbols.length; i++) {
      let note = new Note(Notes.symbols[i], i);
      this.all.push(note);
    }
  }

  nextNatural(note) {
    return (Notes.natural.indexOf(note) + 1) % Notes.natural.length;
  }

  find(symbol) {
    return this.all.find((note) => note.symbol == symbol.toUpperCase());
  }
}

export class Note {
  symbol;
  index;

  constructor(symbol, i) {
    this.symbol = symbol;
    this.index = i;
  }

  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case 'number':
        return this.index;
      default:
        return this.symbol;
    }
  }
}