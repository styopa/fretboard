class Fretboard {
  #svg;
  #width;
  #height;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    [this.#width, this.#height] = [dimensions[2], dimensions[3]];

    this.add_inlays();

    // draw frets
    for (let i = 1; i <= 13; i++) {
      this.add_child(this.#svg, 'path', {
        d: `M${this.get_fret_x(i)} 0 V ${this.#height}`,
        class: 'fret'
      });
    }

    // draw strings
    for (let i = 1; i <= 6; i++) {
      this.add_child(this.#svg, 'path', {
        d: `M0 ${this.get_string_y(i)} H ${this.#width}`,
        class: 'string'
      });
    }
  }

  get_fret_x(i) {
    return this.#width * (2 - 1.059463 ** (13 - i));
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

  add_inlays() {
    const inlay_attrs = {
      cx: undefined,
      cy: this.#height / 2,
      r: 8,
      class: 'inlay'
    }

    for (let i of [3, 5, 7, 9]) {
      let curr = this.get_fret_x(i);
      let prev = this.get_fret_x(i - 1);
      inlay_attrs.cx = (curr + prev) / 2;
      this.add_child(this.#svg, 'circle', inlay_attrs);
    }
  }
}

window.addEventListener('load', function () {
  const svg = document.getElementById('fretboard');
  const f = new Fretboard(svg);
}, false);
