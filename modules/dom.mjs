export function addAttr(element, name, value) {
  const attr = document.createAttribute(name);
  attr.value = value;
  element.setAttributeNode(attr);
}

export function addChild(parnt, child_name, attrs, text) {
  const child = document.createElement(child_name);
  for (const name in attrs) {
    addAttr(child, name, attrs[name]);
  }
  if (text !== undefined) {
    child.appendChild(document.createTextNode(text));
  }
  parnt.appendChild(child);
  return child;
}

export function addText(parnt, text) {
  parnt.appendChild(document.createTextNode(text));
}