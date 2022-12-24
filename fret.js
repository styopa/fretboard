class Fretboard {
  static ns = 'http://www.w3.org/2000/svg';

  #svg;
  #width;
  #height;

  constructor(svg) {
    this.#svg = svg;
    const dimensions = svg.attributes['viewBox'].value.split(/\D+/);
    [this.#width, this.#height] = [dimensions[2], dimensions[3]];

    for (let i = 1; i <= 13; i++) {
      this.add_fret(i);
    }

    for (let i = 1; i <= 6; i++) {
      this.add_string(i);
    }
  }

  add_attr(element, name, value) {
    const attr = document.createAttribute(name);
    attr.value = value;
    element.setAttributeNode(attr);
  }

  add_string(i) {
    const y = this.#height / 7 * i;
    const path = document.createElementNS(Fretboard.ns, 'path');
    this.add_attr(path, 'd', `M0 ${y} H ${this.#width}`);
    this.add_attr(path, 'class', 'string');
    this.#svg.appendChild(path);
  }

  add_fret(i) {
    const x = this.#width * (2 - 1.059463 ** (13 - i));
    const path = document.createElementNS(Fretboard.ns, 'path');
    this.add_attr(path, 'd', `M${x} 0 V ${this.#height}`);
    this.add_attr(path, 'class', 'fret');
    this.#svg.appendChild(path);
  }
}

function draw_fretboard() {
  const svg = document.getElementById('fretboard');
  const f = new Fretboard(svg);
}

window.addEventListener('load', draw_fretboard, false);
