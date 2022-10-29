import counterString from 'utils/counterString';

/**
 * TabUnseen shows an unseen counter in the browser tab.
 */
class TabUnseen {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onChange = this._onChange.bind(this);

		this.app.require([ 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.originalTitle = document.title;
		this.unseen = this.module.charLog.getUnseen();
		this.unseenTargeted = this.module.charLog.getUnseenTargeted();

		this.unseen.on('change', this._onChange);
		this.unseenTargeted.on('change', this._onChange);
		this._onChange();
	}

	_onChange() {
		// Get highest value instead of sum, because multiple character may have
		// counted the same log event.
		let p = this.unseen.props;
		let t = this.unseenTargeted.props;
		let max = 0;
		let hasTargeted = false;
		for (let charId in p) {
			if (p[charId] > max) {
				max = p[charId];
			}
			if (t[charId]) {
				hasTargeted = true;
			}
		}

		document.title = (max > 0
			? hasTargeted
				? '[' + counterString(max) + '] '
				: '(' + counterString(max) + ') '
			: '') + this.originalTitle;
	}

	dispose() {
		document.title = this.originalTitle;
		this.unseen.off('change', this._onChange);
		this.unseenTargeted.off('change', this._onChange);
	}
}

export default TabUnseen;
