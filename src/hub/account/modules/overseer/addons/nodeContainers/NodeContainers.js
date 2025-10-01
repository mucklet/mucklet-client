import NodeContainersComponent from './NodeContainersComponent';
import './nodeContainers.scss';

/**
 * NodeContainers provides components for rendering node containers.
 */
class NodeContainers {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'routeRealmSettings',
			'confirm',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	newNodeContainers(containers, opt) {
		return new NodeContainersComponent(this.module, containers, opt);
	}

	dispose() {}
}

export default NodeContainers;
