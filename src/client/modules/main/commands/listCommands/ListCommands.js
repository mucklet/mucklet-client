import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const usageText = 'list commands';
const shortDesc = "List commands specific to the room";
const helpText =
`<p>Get a list of the commands specific to the room.</p>
<p>Alias: <code>list command</code></p>`;

/**
 * ListCommands adds command to list all commands of current room.
 */
class ListCommands {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'cmdPattern',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'commands',
			alias: [ 'command' ],
			value: (ctx, p) => this.listCommands(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listCommands',
			category: 'basic',
			cmd: 'list commands',
			alias: [ 'list command' ],
			usage: l10n.l('listCommands.usage', usageText),
			shortDesc: l10n.l('listCommands.shortDesc', shortDesc),
			desc: l10n.l('listCommands.helpText', helpText),
			sortOrder: 130,
		});
	}

	listCommands(char, attr) {
		let room = char.inRoom;
		let roomCmds = room.cmds?.props || {};

		let topics = Object.keys(room.cmds.props)
			.map(k => roomCmds[k])
			.filter(m => m.id)
			.map(m => this.module.cmdPattern.getHelpTopic(m.id, m.cmd));

		if (!topics.length) {
			this.module.charLog.logInfo(char, l10n.l('listCommands.noCommands', "{roomName} has no room commands.", { roomName: room.name }));
			return;
		}

		this.module.charLog.logComponent(char, 'listCommands', new Elem(n => n.elem('div', { className: 'listcommands charlog--pad' }, [
			n.component(new Txt(l10n.l('listCommands.roomCommands', "Room commands"), { tagName: 'h4', className: 'charlog--pad' })),
			n.elem('div', topics.map(t =>
				n.elem('div', { className: 'margin-bottom-m' }, [
					n.component(this.module.help.newHelpTopic(t)),
				]),
			)),
		])));
	}
}

export default ListCommands;
