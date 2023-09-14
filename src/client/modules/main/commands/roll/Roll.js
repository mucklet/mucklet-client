import l10n from 'modapp-l10n';
import NumberStep from 'classes/NumberStep';
import RepeatStep from 'classes/RepeatStep';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import StateStep from 'classes/StateStep';
import ValueStep from 'classes/ValueStep';
import Err from 'classes/Err';

const usageText = 'roll <span class="opt">quiet</span> <span class="opt"><span class="param">Roll</span></span>';
const shortDesc = 'Roll dice shown to the room';
const helpText =
`<p>Roll dice and display the result.</p>
<p>If <code>quiet</code> is included, the roll will only be shown to you, instead of all characters in the room.</p>
<p><code class="param">Roll</code> is the xdy±c notation of dice. If omitted, a roll between 1 and 100 will be made.</p>
<p>Alias: <code>qroll</code> (roll quiet)</p>`;
const examples = [
	{ cmd: 'roll', desc: l10n.l('roll.rollDesc', "Rolls between 1 - 100.") },
	{ cmd: 'roll 6', desc: l10n.l('roll.roll6Desc', "Rolls one six sided die.") },
	{ cmd: 'roll 5d6', desc: l10n.l('roll.roll5d6Desc', "Rolls five six sided dice.") },
	{ cmd: 'roll 2d10 + 3', desc: l10n.l('roll.roll2d10+3Desc', "Rolls two ten sided dice and adds 3.") },
	{ cmd: 'roll 10 - 1d10', desc: l10n.l('roll.roll10-1d10Desc', "Rolls a ten sided die and subtracts the result from 10.") },
	{ cmd: 'roll quiet 2d10', desc: l10n.l('roll.rollQuiet2d10Desc', "Quietly rolls two tens sided dice.") },
	{ cmd: 'qroll 1d6', desc: l10n.l('roll.rollQuiet1d6Desc', "Quietly rolls a six sided die.") },
];

/**
 * Roll adds the roll command.
 */
class Roll {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._parseValue = this._parseValue.bind(this);

		this.app.require([
			'api',
			'cmd',
			'help',
			'info',
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		let modifierList = new ItemList({
			regex: /^[^0-9][\w]*/,
			items: [
				{ key: 'quiet', next: new ValueStep('quiet', true) },
			],
		});

		let diceStep = new RepeatStep(
			'dice',
			(next, idx) => {
				let numStep = new NumberStep('count-' + idx, {
					name: "number of dice",
					regex: /^[1-9][0-9]*/,
					errRequired: idx ? () => new Err('roll.required', 'Must be a number that is greater than 0.') : null,
					next: new ListStep('type-' + idx, new ItemList({
						regex: /^[a-zA-Z]/,
						items: [
							{
								key: 'd',
								next: new NumberStep('sides-' + idx, {
									name: "number of sides",
									regex: /^[1-9][0-9]*/,
									errRequired: () => new Err('roll.sidesRequired', "The d should be followed by the number of sides on the dice."),
									next: new StateStep(state => state.setParam('part-' + idx, state.getParam('count-' + idx) + 'd' + state.getParam('sides-' + idx)), { next }),
								}),
							},
						],
					}), {
						name: 'dice type',
						token: null,
						delimToken: 'name',
						trimSpace: false,
						errRequired: null,
						errNotFound: (step, match) => new Err('roll.typeNotFound', 'There is no dice type "{match}". The supported dice type is d (standard multi-sided die).', { name: step.name, match: match }),
						else: new StateStep(state => state.setParam('part-' + idx, state.getParam('count-' + idx)), { next }),
					}),
				});

				// Between each set of dice, we must have +/-
				if (idx > 0) {
					return new ListStep('mod-' + idx, new ItemList({
						regex: /^./,
						items: [
							{ key: '+' },
							{ key: '-' },
						],
					}), {
						name: 'plus or minus',
						token: 'number',
						errRequired: null,
						errNotFound: (step, match) => new Err('roll.typeNotFound', 'Multiple dice expression must be join with +/-'),
						next: numStep,
					});
				}

				return numStep;
			},
		);

		this.module.cmd.addCmd({
			key: 'roll',
			next: [
				new ListStep('modifier', modifierList, {
					name: "roll modifier",
					token: 'name',
					errRequired: null,
				}),
				diceStep,
			],
			value: this._parseValue,
		});

		this.module.cmd.addCmd({
			key: 'qroll',
			next: new ValueStep('quiet', true, {
				next: diceStep,
			}),
			value: this._parseValue,
		});

		this.module.help.addTopic({
			id: 'roll',
			category: 'communicate',
			cmd: 'roll',
			alias: [ 'qroll' ],
			usage: l10n.l('roll.usage', usageText),
			shortDesc: l10n.l('roll.shortDesc', shortDesc),
			desc: l10n.l('roll.helpText', helpText),
			examples,
			sortOrder: 90,
		});
	}

	roll(ctrl, roll, quiet) {
		return this.module.api.call('roller.char.' + ctrl.id, 'roll', { roll, quiet: quiet || undefined });
	}

	_parseValue(ctx, p) {
		let roll = "";
		let i = 0;
		while (p['part-' + i]) {
			roll += (p['mod-' + i] || '') + p['part-' + i];
			i++;
		}
		// Special case when we roll is used without input
		if (i == 0) {
			roll = '1d100';
		// Special case when we only have a number
		} else if (i == 1 && !p['type-0']) {
			roll = '1d' + roll;
		}
		return this.roll(ctx.char, roll, !!p['quiet']);
	}
}

export default Roll;
