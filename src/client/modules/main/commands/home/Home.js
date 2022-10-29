import l10n from 'modapp-l10n';

const usageText = 'home';
const shortDesc = 'Teleport your character home';
const helpText =
`<p>Teleport your character home.</p>
<p>Alias: <code>gohome</code></p>`;

/**
 * Home adds the home command that teleports the character home.
 */
class Home {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'home',
			value: (ctx, p) => this.home(ctx.char),
			alias: [ 'gohome' ]
		});

		this.module.help.addTopic({
			id: 'home',
			category: 'basic',
			cmd: 'home',
			alias: [ 'gohome' ],
			usage: l10n.l('home.usage', usageText),
			shortDesc: l10n.l('home.shortDesc', shortDesc),
			desc: l10n.l('home.helpText', helpText),
			sortOrder: 40,
		});
	}

	home(char) {
		return char.call('teleportHome');
	}
}

export default Home;
