import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import RepeatStep from 'classes/RepeatStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import { exitIcons } from 'components/ExitIcon';
import { directions } from 'components/NavButtons';
import helpAttribDesc from 'utils/helpAttribDesc';
import { communicationTooLong, keyTooLong, itemNameTooLong } from 'utils/cmdErr';
import * as translateErr from 'utils/translateErr';

const usageText = 'set exit <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set an exit attribute';
const helpText =
`<p>Set an exit attribute.</p>
<p><code class="param">Keyword</code> is the keyword of the exit to set.</p>`;
const dirAlias = {
	n: [ 'north' ],
	ne: [ 'northeast' ],
	e: [ 'east' ],
	se: [ 'southeast' ],
	s: [ 'south' ],
	sw: [ 'southwest' ],
	w: [ 'west' ],
	nw: [ 'northwest' ],
};

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "exit name",
			maxLength: () => module.info.getCore().itemNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setExit.nameDesc', "Name of the exit."),
		sortOrder: 10,
	},
	{
		key: 'keywords',
		value: 'keys',
		name: "exit name",
		stepFactory: module => new RepeatStep(
			'keys',
			(next, idx) => new TextStep('key-' + idx, {
				next,
				regex: /^[\s\w]*\w/,
				name: "exit keyword",
				maxLength: () => module.info.getCore().keyMaxLength,
				errTooLong: keyTooLong,
				completer: module.cmdLists.getInRoomExits(),
			}),
			{
				each: (state, step, idx) => {
					let v = (state.getParam('value') || []).slice(0);
					v.push(state.getParam(step.id));
					state.setParam('value', v);
				},
				delimiter: ",",
			},
		),
		desc: l10n.l('setExit.keywordsDesc', "Comma-separated list of case-insensitive keywords used with the <code>go</code> command."),
		sortOrder: 20,
	},
	{
		key: 'icon',
		stepFactory: module => new ListStep('value', new ItemList({
			items: [
				...exitIcons.map(icon => ({
					key: icon,
					alias: dirAlias[icon],
				})),
				{
					key: "none",
					value: '',
				},
			],
		}), { name: "is exit icon" }),
		desc: l10n.l('setExit.iconDesc', "Icon for the exit. Value is {values} or <code>none</code>.", {
			values: exitIcons.map(icon => `<code>${icon}</code>`).join(', '),
		}),
		sortOrder: 30,
	},
	{
		key: 'navigation',
		value: 'nav',
		stepFactory: module => new ListStep('value', new ItemList({
			items: [
				...directions.map(dir => ({
					key: dir,
					alias: dirAlias[dir],
				})),
				{
					key: "none",
					value: '',
				},
			],
		}), { name: "is navigation direction" }),
		desc: l10n.l('setExit.navigationDesc', "Navigation direction for the exit. Value is {values} or <code>none</code>.", {
			values: directions.map(dir => `<code>${dir}</code>`).join(', '),
		}),
		sortOrder: 40,
		alias: [ 'nav' ],
	},
	{
		key: 'hidden',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is hidden flag" }),
		desc: l10n.l('setExit.hiddenDesc', "Flag telling if the exit is hidden, preventing it from being listed. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 190,
	},
	{
		key: 'inactive',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is inactive flag" }),
		desc: l10n.l('setExit.hiddenDesc', "Flag telling if the exit is inactive, preventing it from being listed and used. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 200,
	},
	{
		key: 'transparent',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is transparent flag" }),
		desc: l10n.l('setExit.transparentDesc', "Flag telling if the exit is transparent, allowing you to see awake characters in the target room. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 210,
	},
	{
		key: 'leaveMsg',
		name: "leave message",
		desc: l10n.l('setExit.leaveMsgDesc', "Message seen by the origin room. Usually in present tense (eg. \"leaves ...\")."),
		sortOrder: 300,
	},
	{
		key: 'arriveMsg',
		name: "arrival message",
		desc: l10n.l('setExit.arriveMsgDesc', "Message seen by the arrival room. Usually in present tense (eg. \"arrives from ...\")."),
		sortOrder: 310,
	},
	{
		key: 'travelMsg',
		name: "travel message",
		desc: l10n.l('setExit.travelMsgDesc', "Message seen by the exit user. Usually in present tense (eg. \"goes ...\")."),
		sortOrder: 320,
	},
];

/**
 * SetExit adds command to set exit attributes.
 */
class SetExit {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.exitAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'exit',
			next: [
				new ListStep('exitId', this.module.cmdLists.getInRoomExits(), {
					name: "exit",
					textId: 'exitKey',
					errRequired: step => new Err('setExit.keyRequired', "What exit do you want to set?"),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.exitAttr, {
					name: "exit attribute",
					token: 'attr',
				}),
			],
			value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'setExit',
			category: 'buildRooms',
			cmd: 'set exit',
			usage: l10n.l('setExit.usage', usageText),
			shortDesc: l10n.l('setExit.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setExit.helpText', helpText), this.exitAttr.getItems()),
			sortOrder: 70,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = next || [
			new DelimStep("=", { errRequired: null }),
			attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
					maxLength: () => this.module.info.getCore().communicationMaxLength,
					errTooLong: communicationTooLong,
				}),
		];
		this.exitAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: this.setExit(ctx, p);
	}

	setExit(ctx, p) {
		return ctx.char.call('setExit', Object.assign({ [p.attr]: p.value }, p.exitId
			? { exitId: p.exitId }
			: { exitKey: p.exitKey },
		)).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('setExit.updatedExit', "Exit attribute was successfully set."));
		}).catch(err => {
			throw translateErr.exitNotFound(err, p.exitKey);
		});
	}
}

export default SetExit;
