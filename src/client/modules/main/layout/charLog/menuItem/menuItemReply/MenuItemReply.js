import l10n from 'modapp-l10n';
import { getTargets, replyCmds, replyAllCmds, countTargets } from 'utils/replyToEvent';


/**
 * MenuItemReply adds the char log menu item to reply to targeted communication
 */
class MenuItemReply {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'console',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	charLog: import('modules/main/layout/charLog/CharLog').default,
		 * 	console: import('modules/main/layout/console/Console').default,
		 * }}
		 */
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addMenuItem({
			id: 'reply',
			name: l10n.l('menuItemReply.reply', "Reply"),
			icon: 'comment',
			onClick: this._onReply.bind(this),
			filter: (charId, ev) => replyCmds[ev.type] && (ev.char.id != charId || countTargets(ev) == 1),
			sortOrder: 10,
		});

		this.module.charLog.addMenuItem({
			id: 'replyAll',
			name: l10n.l('menuItemReply.replyAll', "Reply all"),
			icon: 'comments',
			onClick: this._onReplyAll.bind(this),
			filter: (charId, ev) => replyAllCmds[ev.type] && getTargets(charId, ev).length > 1,
			sortOrder: 15,
		});
	}

	_onReply(charId, ev) {
		this.module.console.setCommand(charId, replyCmds[ev.type](charId, ev), true);
		this.module.console.focus();
	}

	_onReplyAll(charId, ev) {
		this.module.console.setCommand(charId, replyAllCmds[ev.type](charId, ev), true);
		this.module.console.focus();
	}

	dispose() {
		this.module.charLog.removeMenuItem('reply');
		this.module.charLog.removeMenuItem('replyAll');
	}
}

export default MenuItemReply;
