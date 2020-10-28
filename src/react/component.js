export function Component(props, context, updater) {
  this.props = props;

  this.context = context;

  this.refs = Object.create({});

  this.updater = null;
}

Component.prototype.isReactComponent = true;