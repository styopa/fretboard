class Fretboard {
  #svg;
  #x;
  #y;
  #width;
  #height;
  #margin;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    this.#margin = 20;
    this.#x = 0;
    this.#y = 0;
    this.#width = dimensions[2];
    this.#height = dimensions[3];

    this.add_line(true, this.#margin, 'nut');

    this.add_inlays();

    // draw frets
    for (let i = 1; i < 13; i++) {
      let x = this.get_fret_x(i);
      //console.log(`Fret ${i} distance from nut ${Math.round(x)}`);
      this.add_line(true, x, 'fret');
    }

    // draw strings
    for (let i = 1; i <= 6; i++) {
      this.add_line(false, this.get_string_y(i), 'string');
    }
  }

  add_line(vertical, pos, cls) {
    const params = vertical ?
      [pos, this.#y, 'V', this.#height] :
      [this.#x, pos, 'H', this.#width];
    params.unshift('M');
    this.add_child(this.#svg, 'path', {
      d: params.join(' '),
      class: cls
    });
  }

  get_fret_x(i) {
    const len_12_frets = this.#width - this.#margin * 2;
    const len_from_nut = len_12_frets * (2 - 1.059463 ** (12 - i));
    return this.#margin + len_from_nut;
  }

  get_string_y(i) {
    return this.#height / 7 * i;
  }

  add_child(parnt, child_name, attrs) {
    const child = document.createElementNS(
      'http://www.w3.org/2000/svg',
      child_name
    );
    for (let name in attrs) {
      let attr = document.createAttribute(name);
      attr.value = attrs[name];
      child.setAttributeNode(attr);
    }
    parnt.appendChild(child);
  }

  get_inlay_x(i) {
    return (this.get_fret_x(i) + this.get_fret_x(i - 1)) / 2;
  }

  add_inlays() {
    const inlay_attrs = {
      cx: undefined,
      cy: this.#height / 2,
      r: 4,
      class: 'inlay'
    }

    for (let i of [3, 5, 7, 9]) {
      inlay_attrs.cx = this.get_inlay_x(i);
      this.add_child(this.#svg, 'circle', inlay_attrs);
    }

    // double inlay on 12th fret
    inlay_attrs.cx = this.get_inlay_x(12);
    let inlay_y = this.#height * 5 / 14;
    for (let y of [inlay_y, this.#height - inlay_y]) {
      inlay_attrs.cy = y;
      this.add_child(this.#svg, 'circle', inlay_attrs);
    }
  }
}

window.addEventListener('load', function () {
  const svg = document.getElementById('fretboard');
  const f = new Fretboard(svg);
}, false);
