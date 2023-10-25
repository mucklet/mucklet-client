import l10n from 'modapp-l10n';
import fullname from 'utils/fullname';


function getTargets(charId, ev) {
	let ts = ev.target ? [ ev.target ] : [];
	if (ev.targets) {
		ts = ts.concat(ev.targets);
	}
	ts = ts.filter(t => t.id != ev.char.id);
	ts.unshift(ev.char);
	ts = ts.filter(t => t.id != charId);
	if (!ts.length) {
		ts = [ ev.char ];
	}
	return ts;
}

function getTargetList(charId, ev) {
	return getTargets(charId, ev).map(t => fullname(t)).join(", ");
}

function getTarget(charId, ev) {
	let t = ev.char;
	if (t.id == charId) {
		t = ev.target || ev.targets[0] || t;
	}
	return fullname(t);
}

function addOoc(ev) {
	return ev.ooc ? '>' : '';
}

const replyCmds = {
	address: (charId, ev) => 'address ' + getTarget(charId, ev) + ' =' + addOoc(ev),
	whisper: (charId, ev) => 'whisper ' + getTarget(charId, ev) + ' =' + addOoc(ev),
	message: (charId, ev) => 'message ' + getTarget(charId, ev) + ' =' + addOoc(ev),
};

const replyAllCmds = {
	address: (charId, ev) => 'address ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
	whisper: (charId, ev) => 'whisper ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
	message: (charId, ev) => 'message ' + getTargetList(charId, ev) + ' =' + addOoc(ev),
};

function countTargets(ev) {
	return (ev.target ? 1 : 0) + (ev.targets?.length || 0);
}

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
	}

	_onReplyAll(charId, ev) {
		this.module.console.setCommand(charId, replyAllCmds[ev.type](charId, ev), true);
	}

	dispose() {
		this.module.charLog.removeMenuItem('reply');
		this.module.charLog.removeMenuItem('replyAll');
	}
}

export default MenuItemReply;
