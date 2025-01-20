import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import { isResError } from 'resclient';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';
import errToL10n from 'utils/errToL10n';
import formatByteSize from 'utils/formatByteSize';

const usageText = 'roomscript <span class="param">Keyword<span class="comment">/</span>#Script ID</span>';
const shortDesc = "Show room script info";
const helpText =
`<p>Show detailed info and source code content of a room script.</p>
<p><code class="param">Keyword</code> is the keyword for the script.</p>
<p><code class="param">#ScriptID</code> is the ID of the script.</p>`;

const logLvlClass = {
	log: 'charlog--default',
	debug: 'charlog--ooc',
	info: 'charlog--strong',
	warn: 'charlog--cmd',
	error: 'charlog--error',
};

/**
 * RoomScript adds the room script command.
 */
class RoomScript {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'help',
			'charLog',
			'roomAccess',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'roomscript',
			next: new IDStep('scriptId', {
				name: "script key or ID",
				else: new ListStep('scriptId', this.module.roomAccess.getInRoomScriptTokens(), {
					name: "room script",
				}),
			}),
			value: (ctx, p) => this.roomScript(ctx.char, p.scriptId),
		});

		this.module.help.addTopic({
			id: 'roomScript',
			category: 'buildRooms',
			cmd: 'roomscript',
			usage: l10n.l('roomScript.usage', usageText),
			shortDesc: l10n.l('roomScript.shortDesc', shortDesc),
			desc: l10n.l('roomScript.helpText', helpText),
			sortOrder: 200,
		});
	}

	roomScript(char, scriptId) {
		return this.module.api.get(`core.roomscript.${scriptId}.details`).then(script => {
			let fetchError = true;
			return (!script.source || isResError(script.source)
				? Promise.resolve(script.source ? l10n.t(errToL10n(script.source)) : null)
				// First refresh the tokens as the access token may have expired.
				: this.module.auth.refreshTokens().then(() => fetch(script.source.href, {
					credentials: 'include',
				}).then(response => {
					fetchError = response.status >= 300;
					return response.text();
				}).catch(err => {
					return "Error fetching script: " + String(err);
				}))
			).then(source => {
				try {
					let rows = [
						[ l10n.t('roomScript.keyword', "Keyword"), script.key ],
						[ l10n.t('roomScript.scriptId', "Script ID"), '<span class="charlog--code-simple">#' + script.id + '</span>', true ],
						[ l10n.t('roomScript.postAddress', "Post address"), '<span class="charlog--code-simple">' + script.address + '</span>', true ],
					];

					let binary = script.binary;
					if (binary?.href) {
						rows.push([
							l10n.t('roomScript.binaryFile', "Binary file"),
							`<a href="${escapeHtml(binary.href)}" class="link" download>${escapeHtml(binary.filename)}</a> (${formatByteSize(script.binary.size)})`,
							true,
						]);
					}

					rows.push([
						l10n.t('roomScript.active', "Active"),
						'<i class="fa fa-circle listroomscripts-' + (script.active ? 'active' : 'inactive') + '" aria-hidden></i>',
						true,
					]);

					let elem = new Elem(n => {
						let inner = [
							n.component(new Txt(l10n.t('roomScript.roomScriptInfo', "Room script info"), { tagName: 'h4' })),
							n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, rows.map(m => n.elem('tr', [
								n.elem('td', { className: 'charlog--strong' }, [
									n.text(m[0]),
								]),
								n.elem('td', [
									n.html(m[2] ? m[1] : escapeHtml(m[1])),
								]),
							]))),
						];
						if (source) {
							inner.push(n.component(new Txt(l10n.t('roomScript.sourceCode', "Source code"), { tagName: 'h4', className: 'charlog--pad' })));
							inner.push(n.elem('div', { className: 'charlog--code' }, [
								n.elem('pre', { className: fetchError ? 'common--error' : 'common--pre-wrap charlog--source' }, [
									n.text(source),
								]),
							]));
						}
						if (script.logs.length) {
							inner.push(n.component(new Txt(l10n.t('roomScript.recentErrors', "Recent logs"), { tagName: 'h4', className: 'charlog--pad' })));
							inner.push(n.elem('div', { className: 'charlog--code' }, [
								n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, script.logs.toArray().reverse().map(m => n.elem('tr', [
									n.elem('td', { className: 'charlog--strong' }, [
										n.text(formatDateTime(new Date(m.time), { showMilliseconds: true })),
									]),
									n.elem('td', [
										n.elem('pre', { className: 'common--pre-wrap ' + (logLvlClass[m.lvl] || '') }, [
											n.text(m.msg),
										]),
									]),
								]))),
							]));
						}
						return n.elem('div', { className: 'charlog--pad' }, inner);
					});

					this.module.charLog.logComponent(char, 'roomScript', elem);
				} catch (ex) {
					console.error(ex);
				}
			});
		});
	}
}

export default RoomScript;
