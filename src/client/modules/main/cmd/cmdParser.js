import CmdState from './CmdState';
import UnknownStep from 'classes/UnknownStep';

const tokenTags = {
	error: 'invalid',
	listitem: 'attributeValue',
	text: 'string',
	delim: 'operator',
	cmd: 'name',
	attr: 'propertyName',
	unknown: 'comment',
	entityid: 'keyword',
};

export default function(cfg) {
	return {
		startState: function() {
			return new CmdState(
				cfg.step,
				[ cfg.step ],
				[ cfg.ctx ],
				{},
				{},
				null
			);
		},

		blankLine: function(state) {
			let l = state.stack.length;
			let step = l > 0 ? state.stack[l - 1] : null;
			if (step && typeof step.blank == 'function') {
				step.blank(state);
			}
		},

		token: function(stream, state) {
			let token = false;
			let count = 0;
			let step = null;
			while (token === false) {
				step = state.stack.pop() || new UnknownStep();
				token = step.parse(stream, state);
				count++;
				if (count > 100) {
					let message = "Maximum parsing recursions exceeded.";
					console.error(message, state);
					state.setError({ code: 'cmd.recursionError', message });
					state.setStack([ new UnknownStep() ]);
				}
			}
			state.step = step;
			return (token && tokenTags[token]) || token;
		},

		copyState: function(state) {
			return state.clone();
		}

	};
};
