import exportFile from 'utils/exportFile';
import formatISODate from 'utils/formatISODate';
import formatDateTime from 'utils/formatDateTime';
import escapeHtml from 'utils/escapeHtml';
import {
	htmlStart,
	headStart,
	titleStart,
	titleEnd,
	styleStart,
	style,
	styleEnd,
	headEnd,
	bodyStart,
	bodyEnd,
	htmlEnd,

	sayStyle,
	controlStyle,
	controlBorderStyle,
	describeStyle,
	infoStyle,
	whisperStyle,
	actionStyle,
	travelRoomStyle,
	summonStyle,
	warnStyle,
	warnFieldsetStyle,
	warnFieldsetLabelStyle,
	dndStyle,
} from './htmlTemplate';

class ExportLog {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._charLogConverter = this._charLogConverter.bind(this);

		this.app.require([ 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.eventTypes = {};

		const eventTypes = {
			info: { style: infoStyle },
			control: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noButton: true }),
				style: {
					'.ev-control': controlStyle,
					'.ev-control--border': controlBorderStyle
				}
			},
			say: { style: sayStyle },
			pose: { style: sayStyle },
			wakeup: { style: actionStyle },
			sleep: { style: actionStyle },
			leave: { style: actionStyle },
			arrive: { style: actionStyle },
			travel: { style: {
				'.ev-travel': actionStyle,
				'.ev-travel--room': travelRoomStyle
			}},
			whisper: { style: whisperStyle },
			message: { style: whisperStyle },
			describe: { style: describeStyle },
			summon: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noCode: true }),
				style: summonStyle,
			},
			join: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noCode: true }),
				style: summonStyle,
			},
			follow: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noCode: true }),
				style: summonStyle,
			},
			leadRequest: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noCode: true }),
				style: summonStyle,
			},
			followRequest: {
				converter: (charId, ev) => this._charLogConverter(charId, ev, { noCode: true }),
				style: summonStyle,
			},
			stopLead: { style: summonStyle },
			stopFollow: { style: summonStyle },
			ooc: { style: sayStyle },
			warn: { style: {
				'.ev-warn': warnStyle,
				'.ev-warn .charlog--fieldset': warnFieldsetStyle,
				'.ev-warn .charlog--fieldset-label': warnFieldsetLabelStyle
			}},
			action: { style: actionStyle },
			mail: { style: whisperStyle },
			address: { style: sayStyle },
			dnd: { style: dndStyle },
		};

		for (let k in eventTypes) {
			let t = eventTypes[k];
			this.addEventType(Object.assign({ id: k }, {
				converter: t.converter || this._createCharLogConverter,
				style: t.style
			}));
		}
	}

	/**
	 * Adds an event type converter for generating HTML.
	 * @param {object} type Event type object.
	 * @param {string} type.id Event type id.
	 * @param {function} [type.converter] Converter function. function(charId, ev) -> HTMLstring. Defaults to using the charLog event component factory.
	 * @param {string|object} [type.style] Css style to add. If style is a string, the key will be assumed ".ev-<typeId>". Otherwise the key is the selector and value is the css.
	 * @returns {this}
	 */
	addEventType(type) {
		if (this.eventTypes[type.id]) {
			throw new Error(type.id + " already registered.");
		}
		this.eventTypes[type.id] = {
			id: type.id,
			converter: type.converter || this._charLogConverter,
			style: type.style
		};
		return this;
	}

	removeEventType(typeId) {
		delete this.eventTypes[typeId];
		return this;
	}

	exportHtml(char, timestamp) {
		return this._getLog(char, timestamp).then(log => {
			try {
				let date = new Date(timestamp);

				let a = [
					htmlStart,
					headStart,
					titleStart
				];

				// Add title
				a.push(escapeHtml("Log " + char.name + ' - ' + formatDateTime(date)));
				a.push(titleEnd);
				a.push(styleStart);
				a.push(style);
				let styleIdx = a.length;
				a.push(""); // Style placeholder

				a.push(styleEnd);
				a.push(headEnd);
				a.push(bodyStart);

				let usedTypes = {};
				for (let ev of log) {
					let t = this.eventTypes[ev.type];
					if (t) {
						let v = t.converter(char.id, ev);
						if (v) {
							let ec = ev.char;
							a.push(
								'<div class="ev ev-' + ev.type + '"' + (ec
									? ' title="' + escapeHtml((ec.name + " " + ec.surname).trim()) + (ev.time ? "&#013;" + escapeHtml(formatDateTime(new Date(ev.time))) : '') + '"'
									: ev.time
										? ' title="' + escapeHtml(formatDateTime(new Date(ev.time))) + '"'
										: ''
								) + ">" +
								v +
								"</div>"
							);
							usedTypes[ev.type] = true;
						}
					}
				}

				a.push(bodyEnd);
				a.push(htmlEnd);

				a[styleIdx] = this._generateTypeStyles(Object.keys(usedTypes));

				let out = new Blob(a, { type: 'text/html' });
				let filename = char.name + '_' + formatISODate(date) + '_' + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + '.html';
				exportFile(filename, out);
			} catch (ex) {
				return Promise.reject({ code: 'exportLog.failed', message: "Failed to export log: {message}", data: { message: ex.message }});
			}
		});
	}

	_getLog(char, timestamp, chunk, log) {
		chunk = chunk || 0;
		log = log || [];
		return this.module.charLog.getLog(char, chunk).then(l => {
			if (!l || !l.length) return log;

			if (!Array.isArray(l)) l = l.toArray();

			for (let i = l.length - 1; i >= 0; i--) {
				let ev = l[i];
				if (ev.time && ev.time < timestamp) {
					return l.slice(i + 1).concat(log);
				}
			}

			return this._getLog(char, timestamp, chunk + 1, l.concat(log));
		});
	}

	_charLogConverter(charId, ev, opt) {
		if (ev.component) {
			return null;
		}
		let f = this.module.charLog.getEventComponentFactory(ev.type);
		let c = f && f(charId, ev, opt);
		if (!c) return null;
		let div = document.createElement('div');
		c.render(div);
		let v = div.innerHTML;
		c.unrender();
		return v;
	}

	_generateTypeStyles(types) {
		types.sort();
		let styles = {};
		for (let typeId of types) {
			let st = this.eventTypes[typeId].style;
			if (st) {
				st = typeof st == 'string'
					? { ['.ev-' + typeId ]: st }
					: st;

				for (let k in st) {
					let csspart = st[k];
					let selectors = styles[csspart];
					if (!selectors) {
						selectors = [];
						styles[csspart] = selectors;
					}
					if (selectors.indexOf(k) < 0) {
						selectors.push(k);
					}
				}
			}
		}

		let result = "";
		for (let csspart in styles) {
			result += styles[csspart].join(", ") + " { " + csspart + " }\n";
		}
		return result;
	}
}

export default ExportLog;
