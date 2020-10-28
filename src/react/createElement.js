import { TEXT_SYMBOL } from 'react-dom';

const UNSAFE_PROPS_KEY = {
  key: "key",
  ref: "ref",
  __self: "__self",
  __source: "__source"
};

export function creatTextNode(text) {
  return ReactElement(TEXT_SYMBOL, null, null, null, null, null, {
    children: [],
    nodeValue: text
  });
}

export function ReactElement(type, key, ref, self, source, owner, props) {
  const element = {
    $$typeof: Symbol("reactElement"),
    type,
    key,
    ref,
    props,
    _owner: owner
  };

  return element;
}

export function createElement(type, config, ...children) {
  const props = {};

  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  if (config != null) {
    key = config.key;
    ref = config.ref;
    self = config.__self || null;
    source = config.__source || null;

    if (type && type.defaultProps) {
      for (const propKey in type.defaultProps) {
        type.defaultProps[propKey] &&
          (props[propKey] = type.defaultProps[propKey]);
      }
    }

    for (const propKey in config) {
      if (propKey in config && !(propKey in UNSAFE_PROPS_KEY)) {
        props[propKey] = config[propKey];
      }
    }
  }
  props.children = children.map(child =>
    typeof child === "object" ? child : creatTextNode(child)
  );

  return ReactElement(type, key, ref, self, source, null, props);
}