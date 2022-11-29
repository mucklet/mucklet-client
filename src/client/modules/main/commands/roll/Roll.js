import l10n from 'modapp-l10n';
import NumberStep from 'classes/NumberStep';
import RepeatStep from 'classes/RepeatStep';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import StateStep from 'classes/StateStep';

const usageText = 'roll <span class="opt"><span class="param">Roll</span></span>';
const shortDesc = 'Roll dice shown to the room';
const helpText =
`<p>Roll dice and display the result for all characters in the room.</p>
<p><code class="param">Roll</code> is the xdy±c notation of dice. If omitted, a roll between 1 and 100 will be made.</p>`;
const examples = [
	{ cmd: 'roll', desc: l10n.l('roll.rollDesc', "Rolls between 1 - 100.") },
	{ cmd: 'roll 6', desc: l10n.l('roll.roll6Desc', "Rolls one six sided die.") },
	{ cmd: 'roll 5d6', desc: l10n.l('roll.roll5d6Desc', "Rolls five six sided dice.") },
	{ cmd: 'roll 2d10 + 3', desc: l10n.l('roll.roll2d10+3Desc', "Rolls two ten sided dice and adds 3.") },
	{ cmd: 'roll 10 - 1d10', desc: l10n.l('roll.roll10-1d10Desc', "Rolls a ten sided die and subtracts the result from 10.") },
];

/**
 * Roll adds the roll command.
 */
class Roll {
	constructor(app) {
		this.app = app;

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

		this.module.cmd.addCmd({
			key: 'roll',
			next: new RepeatStep(
				'dice',
				(next, idx) => {
					let numStep = new NumberStep('count-' + idx, {
						name: "number of dice",
						regex: /^[1-9][0-9]*/,
						errRequired: idx ? () => ({ code: 'roll.required', message: 'Must be a number that is greater than 0.' }) : null,
						next: new ListStep('type-' + idx, new ItemList({
							regex: /^[a-zA-Z]/,
							items: [
								{
									key: 'd',
									next: new NumberStep('sides-' + idx, {
										name: "number of sides",
										regex: /^[1-9][0-9]*/,
										errRequired: () => ({ code: 'roll.sidesRequired', message: "The d should be followed by the number of sides on the dice." }),
										next: new StateStep(state => state.setParam('part-' + idx, state.getParam('count-' + idx) + 'd' + state.getParam('sides-' + idx)), { next }),
									}),
								},
							],
						}), {
							name: 'dice type',
							token: 'name',
							delimToken: 'name',
							trimSpace: false,
							errRequired: null,
							errNotFound: (step, match) => ({ code: 'roll.typeNotFound', message: 'There is no dice type "{match}". The supported dice types are d (normal multi-sided die) and f (fate die).', data: { name: step.name, match: match }}),
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
							errNotFound: (step, match) => ({ code: 'roll.typeNotFound', message: 'Multiple dice expression must be join with +/-' }),
							next: numStep,
						});
					}

					return numStep;
				},
			),
			value: (ctx, p) => {
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
				return this.roll(ctx.char, roll);
			},
		});

		this.module.help.addTopic({
			id: 'roll',
			category: 'basic',
			cmd: 'roll',
			usage: l10n.l('roll.usage', usageText),
			shortDesc: l10n.l('roll.shortDesc', shortDesc),
			desc: l10n.l('roll.helpText', helpText),
			examples,
			sortOrder: 0,
		});
	}

	roll(ctrl, roll) {
		return this.module.api.call('roller.char.' + ctrl.id, 'roll', { roll });
	}
}

export default Roll;
