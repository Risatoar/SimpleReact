export const TEXT_SYMBOL = "TEXT";
export const UN_VAILD_PROPS_KEY = ["children", "name"];

export function render(vnode, container) {
  wipRoot = {
    stateNode: container,
    props: {
      children: [vnode]
    }
  };

  nextUnitOfWork = wipRoot;
}

export function createNode(vnode, parentNode) {
  const { type, nodeValue, props } = vnode;

  let node;
  const nodeType = typeof type;
  const isFragment = nodeType === "undefined";
  if (type === TEXT_SYMBOL) {
    node = document.createTextNode(nodeValue);
  } else if (nodeType === "string") {
    node = document.createElement(type);
  } else if (nodeType === "function") {
    const creator = type.prototype.isReactComponent
      ? updateClassComponent
      : updateFunctionComponent;
    node = creator(vnode, parentNode);
  }

  if (!isFragment) {
    props.children.forEach(child => {
      render(child, node);
    });

    updateNode(node, props);
  } else {
    props.children.forEach(child => {
      render(child, parentNode);
    });
  }
  return node;
}

export function updateNode(node, value) {
  Object.keys(value).forEach(key => {
    !UN_VAILD_PROPS_KEY.includes(key) && (node[key] = value[key]);
  });
}

function updateClassComponent(node, parentNode) {
  const { type, props } = node;

  const vnode = new type(props).render();

  return createNode(vnode, parentNode);
}

function updateFunctionComponent(node, parentNode) {
  const { type, props } = node;

  const vnode = type(props);

  return createNode(vnode, parentNode);
}

function reconcileChildren(workInProgress, children) {
  if (!workInProgress) return;
  let prevNewFiber = null;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    let newFiber = {
      type: child.type,
      key: child.key,
      props: child.props,
      stateNode: null,
      child: null,
      sibling: null,
      return: workInProgress
    };

    if (i === 0) {
      workInProgress.child = newFiber;
    } else {
      prevNewFiber.sibling = newFiber;
    }
    //child 是vnode，vnode->dom节点，插入到父dom节点中就可以了
    // render(child, workInProgress);
    prevNewFiber = newFiber;
  }
}

let nextUnitOfWork = null;

let wipRoot = null;

function updateHostComponet(workInProgress) {
  if (!workInProgress.stateNode) {
    workInProgress.stateNode = createNode(workInProgress);
  }
  reconcileChildren(workInProgress, workInProgress.props.children);
}

function performUnitOfWrok(workInProgress) {
  updateHostComponet(workInProgress);

  if (workInProgress.child) {
    return workInProgress.child;
  }

  let next = workInProgress;
  while (next) {
    if (next.sibling) {
      return next.sibling;
    }
    next = next.return;
  }
}

function commitRoot() {
  commitWorker(wipRoot.child);
  wipRoot = null;
}

function commitWorker(workInProgress) {
  if (!workInProgress) {
    return;
  }
  let parentNodeFiber = workInProgress.return;
  let parentNode = parentNodeFiber.stateNode;
  if (workInProgress.stateNode) {
    parentNode.appendChild(workInProgress.stateNode);
  }

  commitWorker(workInProgress.child);
  commitWorker(workInProgress.sibling);
}

function workLoop(idleDeadline) {
  while (nextUnitOfWork && idleDeadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWrok(nextUnitOfWork);
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

window.requestIdleCallback(workLoop);