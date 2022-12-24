function add_attr(element, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  element.setAttributeNode(attr);
}

function add_path(element, data, cls) {
  const path = document.createElement('path');
  add_attr(path, 'd', data);
  add_attr(path, 'class', cls);
  element.appendChild(path);
}

function create_svg(x, y, width, height) {
  const svg = document.createElement('svg');
  add_attr(svg, 'viewbox', [x, y, width, height].join(' '));
  add_attr(svg, 'xmlns', 'http://www.w3.org/2000/svg');

  for (let i = 1; i <= 6; i++) {
    add_path(svg, `M0 ${height / 7 * i} H ${width}`, 'string');
  }

  for (let i = 1; i <= 13; i++) {
    // distance from bridge
    // w*r^12|...|w*r^2|w*r^1|w*r^0
    // left = 2w - d
    // d = w * r ^ (13 - i)
    // left = w * (2 - r ^ (13 - i))
    let left = width * (2 - 1.059463 ** (13 - i));
    add_path(svg, `M${left} 0 V ${height}`, 'fret');
  }

  return svg;
}

function fake() {
  const svg = document.createElement('svg');
  add_attr(svg, 'viewbox', "0 0 300 100");
  add_attr(svg, 'xmlns', 'http://www.w3.org/2000/svg');
  add_attr(svg, 'stroke', 'red');
  add_attr(svg, 'fill', 'grey');

  const path = document.createElement('circle');
  add_attr(path, 'cx', 50);
  add_attr(path, 'cy', 50);
  add_attr(path, 'r', 40);

  svg.appendChild(path);

  return svg;
}

window.onload = function() {
  //const frag = document.createDocumentFragment();
  //frag.append(create_svg(0, 0, 700, 200));
  const fretboard = document.getElementById('fretboard');
  fretboard.appendChild(fake());
}
