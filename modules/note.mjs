class CyclicArray extends Array {
  * since(elem, skip = 0) {
    const start = this.indexOf(elem);
    if (start === -1) {
      throw new RangeError(`Element ${elem} not found`)
    }
    for (let i = 0; i < this.length; i++) {
      yield this[(start + skip + i) % this.length];
    }
  }

  randomElements(n) {
    if (n > this.length) {
      throw new RangeError(`Have ${this.length} elements, requested ${n}`);
    }

    const options = this.slice();
    const result = [];
    for (let i = 0; i < n; i++) {
      let selection = Math.floor(Math.random() * options.length);
      let element = options.splice(selection, 1)[0];
      result.push(element);
    }

    return result;
  }
}

export class Note {
  symbol;
  index;
  natural;

  constructor(symbol, i) {
    this.symbol = symbol;
    this.index = i;
    this.natural = symbol.length == 1;
  }

  toClassName() {
    return this.symbol.toLowerCase()
      .replace('♯', 'sharp')
      .replace('♭', 'flat');
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

export class Notes {
  all;
  natural;

  static {
    Notes.symbols = CyclicArray.from('C C♯ D D♯ E F F♯ G G♯ A B♭ B'.split(' '));
  }

  constructor() {
    this.all = CyclicArray.from(Notes.symbols.map((s, i) => new Note(s, i)));
    this.natural = this.all.filter((note) => note.natural);
  }

  find(symbol) {
    return this.all.find((note) => note.symbol == symbol.toUpperCase());
  }
}