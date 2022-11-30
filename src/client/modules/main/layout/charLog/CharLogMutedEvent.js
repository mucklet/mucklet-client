import PopupPill from 'components/PopupPill';

const dark = 'dark';
const border = 'border';
const eventTypes = {
	travel: dark,
	arrive: dark,
	leave: dark,
	wakeup: dark,
	sleep: dark,
	roll: dark,

	whisper: border,
	message: border,
	mail: border,
	address: border,
	controlRequest: border,
	summon: border,
	join: border,
	leadRequest: border,
	followRequest: border,
	follow: border,
	stopFollow: border,
	stopLead: border,
	dnd: border,
};

class CharLogMutedEvent extends PopupPill {
	constructor(module, char, ctx, ev) {
		let ec = ev.char;
		let charId = char.id;
		super(() => module.self.getLogEventComponent(charId, ev, { noFocus: true, noMessageHighlight: true }), {
			ctx,
			type: eventTypes[ev.type],
			pillClassName: ec ? 'mf-' + charId + '-' + ec.id : '',
		});
	}
}

export default CharLogMutedEvent;
