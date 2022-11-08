import l10n from 'modapp-l10n';

const usageText = 'register home';
const shortDesc = 'Set current room as home';
const helpText =
`<p>Register current room as home for your character, if the room allows for residents.</p>`;

/**
 * RegisterHome adds command to register the character's home.
 */
class RegisterHome {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('register', {
			key: 'home',
			value: (ctx, p) => this.registerHome(ctx.char, { [p.attr]: p.value }),
		});

		this.module.help.addTopic({
			id: 'registerHome',
			category: 'basic',
			cmd: 'register home',
			usage: l10n.l('registerHome.usage', usageText),
			shortDesc: l10n.l('registerHome.shortDesc', shortDesc),
			desc: l10n.l('registerHome.helpText', helpText),
			sortOrder: 50,
		});
	}

	registerHome(char, params) {
		return char.call('setHome', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('registerHome.homeWasRegistered', "Current room is registered as home."));
		});
	}
}

export default RegisterHome;
