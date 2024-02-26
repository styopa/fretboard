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
  static all;
  static natural;

  static {
    const symbols = CyclicArray.from('C C♯ D D♯ E F F♯ G G♯ A B♭ B'.split(' '));
    this.all = CyclicArray.from(symbols.map((s, i) => new this(s, i)));
    this.natural = this.all.filter((note) => note.isNatural());
  }

  static fromSymbol(symbol) {
    return this.all.find((note) => note.symbol == symbol.toUpperCase());
  }

  symbol;
  index;

  constructor(symbol, i) {
    this.symbol = symbol;
    this.index = i;
  }

  isNatural() {
    return this.symbol.length == 1;
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

export class Tuning {
  static sixStringStandard() {
    return new this('eBGDAE');
  }

  static sixStringDropD() {
    return new this('eBGDAD');
  }

  notes;

  constructor(symbols) {
    this.notes = symbols.split('').map((s) => Note.fromSymbol(s));
  }
}