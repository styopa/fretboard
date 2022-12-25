class Fretboard {
  #svg;
  #width;
  #height;
  #margin;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    this.#margin = 20;
    this.#width = dimensions[2];
    this.#height = dimensions[3];

    const nut = this.addLine(true, this.#margin, 'nut');
    this.addAttr(nut, 'stroke-width', 8);

    this.addInlays();

    // draw frets
    for (let i = 1; i < 13; i++) {
      let x = this.getFretX(i);
      //console.log(`Fret ${i} distance from nut ${Math.round(x)}`);
      let fret = this.addLine(true, x, 'fret');
      this.addAttr(fret, 'stroke-width', 4);
    }

    // draw strings
    const gauges = [.011, .014, .018, .028, .038, .049];
    for (let i = 0; i < 6; i++) {
      let str = this.addLine(false, this.getStringY(i + 1), 'string');
      this.addAttr(str, 'stroke-width', gauges[i] * 50);
    }
  }

  addLine(vertical, pos, cls) {
    const params = vertical ?
      [pos, 0, 'V', this.#height] :
      [0, pos, 'H', this.#width];
    params.unshift('M');
    return this.addChild(this.#svg, 'path', {
      d: params.join(' '),
      class: cls
    });
  }

  getFretX(i) {
    const len_12_frets = this.#width - this.#margin * 2;
    const len_from_nut = len_12_frets * (2 - 1.059463 ** (12 - i));
    return this.#margin + len_from_nut;
  }

  getStringY(i) {
    return this.#height / 7 * i;
  }

  addAttr(element, name, value) {
    const attr = document.createAttribute(name);
    attr.value = value;
    element.setAttributeNode(attr);
  }

  addChild(parnt, child_name, attrs) {
    const child = document.createElementNS(
      'http://www.w3.org/2000/svg',
      child_name
    );
    for (let name in attrs) {
      this.addAttr(child, name, attrs[name]);
    }
    parnt.appendChild(child);
    return child;
  }

  getInlayX(i) {
    return (this.getFretX(i) + this.getFretX(i - 1)) / 2;
  }

  addInlays() {
    const inlay_attrs = {
      cx: undefined,
      cy: this.#height / 2,
      r: 4,
      class: 'inlay'
    }

    for (let i of [3, 5, 7, 9]) {
      inlay_attrs.cx = this.getInlayX(i);
      this.addChild(this.#svg, 'circle', inlay_attrs);
    }

    // double inlay on 12th fret
    inlay_attrs.cx = this.getInlayX(12);
    let inlay_y = this.#height * 5 / 14;
    for (let y of [inlay_y, this.#height - inlay_y]) {
      inlay_attrs.cy = y;
      this.addChild(this.#svg, 'circle', inlay_attrs);
    }
  }
}

window.addEventListener('load', function () {
  const svg = document.getElementById('fretboard');
  const f = new Fretboard(svg);
}, false);
