import { Elem, Context } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import { Collection, CollectionWrapper } from 'modapp-resource';
import SimpleBar from 'components/SimpleBar';
import CharLogMuted from './CharLogMuted';

const LOAD_CHUNK_THRESHOLD = 200;

class CharLogComponent {
	constructor(module, char, opt) {
		opt = opt || {};
		this.module = module;
		this.char = char;
		this.onAtBottom = opt.onAtBottom;
		this.chunks = [];
		this.nextChunk = 0;
		this.overlayState = {};
		this.renderedOverlays = {};
		this.mutedCtx = {};

		// Bind callbacks
		this._onScroll = this._onScroll.bind(this);
		this._onEventAdd = this._onEventAdd.bind(this);
		this._onLogClick = this._onLogClick.bind(this);

		this.prerender = document.createElement('div');
		this.prerender.className = 'charlog--list';
		this.prerender.render = function(el) { el.appendChild(this); };
		this.prerender.unrender = function() { this.parentElement.removeChild(this); };
		this._loadNextChunk();
	}

	isRendered() {
		return !!this.elem;
	}

	render(el) {
		let layout = this.module.layout.getCurrentLayout();
		this.simpleBar = new SimpleBar(
			this.prerender,
			{
				className: 'charlog--log',
				forceVisible: 'y',
				autoHide: false,
				lockToBottom: true,
				onAtBottom: this.onAtBottom,
				events: {
					click: this._onLogClick,
				},
			},
		);
		this.elem = new Elem(n => n.elem('div', { className: 'charlog' }, [
			n.component('simpleBar', new ModelComponent(
				null,
				this.simpleBar,
				(m, c) => {
					c[m?.highlightTriggers ? 'addClass' : 'removeClass']('charlog--highlight-triggers');
					c[m?.highlightMentionMessages ? 'addClass' : 'removeClass']('charlog--highlight-mention');
					c[m?.highlightOwnMessages ? 'addClass' : 'removeClass']('charlog--highlight-own');
				},
			)),
			n.component(new Context(
				() => new CollectionWrapper(
					this.module.self.getOverlays(),
					{
						filter: t => t.filter ? t.filter(this.char, layout) : true,
						eventBus: this.module.self.app.eventBus,
					},
				),
				overlays => overlays.dispose(),
				overlays => new CollectionList(overlays,
					overlay => {
						let state = this.overlayState[overlay.id];
						if (!state) {
							state = {};
							this.overlayState[overlay.id] = state;
						}
						return overlay.componentFactory(this.char, state);
					},
				),
			)),
		]));

		let elem = this.elem;
		this.module.highlightSettings.getSettingsPromise().then(settings => {
			if (this.elem == elem) {
				this.elem.getNode('simpleBar').setModel(settings);
			}
		});

		let rel = this.elem.render(el);
		if (this.simpleBar.atBottom && this.onAtBottom) {
			this.onAtBottom(true);
		}
		this._scrollElem().addEventListener('scroll', this._onScroll);
		return rel;
	}

	unrender() {
		if (this.elem) {
			this._scrollElem().removeEventListener('scroll', this._onScroll);
			if (this.simpleBar.atBottom && this.onAtBottom) {
				this.onAtBottom(false);
			}
			this.elem.unrender();
			this.elem = null;
			this.simpleBar = null;
		}
	}

	dispose() {
		this.unrender();
		if (this.chunks) {
			if (this.chunks.length) {
				this.chunks[0].log.off('add', this._onEventAdd);
				for (let chunk of this.chunks) {
					chunk.component.unrender();
				}
			}
			this.chunks = null;
		}
	}

	_loadNextChunk() {
		// Assert we are not loading twice;
		let chunkIdx = this.chunks.length;
		if (chunkIdx < this.nextChunk) return;
		this.nextChunk++;

		this.module.self.getLog(this.char, chunkIdx).then(log => {
			if (!this.chunks || !log) return;

			let se = this._scrollElem();
			let fromBottom = se ? se.scrollHeight - se.scrollTop : 0;

			let muteTrail = this._moveMuteTrail(log, chunkIdx);

			let components = new Collection({ data: this._componentsFromLog(log, muteTrail), idAttribute: null, eventBus: this.module.self.app.eventBus });
			let c = new CollectionList(components, m => m);
			if (!chunkIdx) {
				log.on('add', this._onEventAdd);
			}
			this.chunks[chunkIdx] = { component: c, log, components, len: log.length };
			let div = document.createElement('div');
			this.prerender.insertBefore(div, this.prerender.firstChild);
			c.render(div);

			if (se) {
				se.scrollTop = se.scrollHeight - fromBottom;
				this._onScroll();
			}
		});
	}

	_scrollElem() {
		return this.simpleBar && this.simpleBar.simplebar.getScrollElement() || null;
	}

	_onScroll() {
		let se = this._scrollElem();
		if (se && se.scrollTop < LOAD_CHUNK_THRESHOLD) {
			this._loadNextChunk();
		}
	}

	// Moves any muted events at the bottom of the chunk's log to the
	// CharLogMuted container at the start of the following chunk. This
	// is to prevent muted events to be split up in two components even if they
	// belong to different chunks. */
	_moveMuteTrail(log, chunkIdx) {
		if (!chunkIdx) return 0;

		let muteTrail = 0;
		for (let idx = log.length - 1; idx >= 0; idx--) {
			let ev = log[idx];
			if (this._isMuted(ev)) {
				muteTrail++;
				let i = chunkIdx;
				while (i--) {
					let o = this.chunks[i];
					if (!i || o.components.length) {
						let comp = o.components.atIndex(0);
						if (comp instanceof CharLogMuted) {
							comp.addEvent(ev, 0);
						} else {
							o.components.add(new CharLogMuted(this.module, this.char, this.mutedCtx, [ ev ]), 0);
						}
						break;
					}
					o.muteTrail++;
				}
			}
		}
		return muteTrail;
	}

	_componentsFromLog(log, muteTrail) {
		let len = log.length - muteTrail;

		let list = [];
		let muted = null;
		for (let ev of log) {
			if (!len) break;
			len--;

			// Check for muted events
			if (this._isMuted(ev)) {
				muted = muted || new CharLogMuted(this.module, this.char, this.mutedCtx);
				muted.addEvent(ev, muted.length);
				continue;
			}

			if (muted) {
				list.push(muted);
				muted = null;
			}
			list.push(this.module.self.getLogEventComponent(this.char.id, ev));
		}
		if (muted) {
			list.push(muted);
		}

		return list;
	}

	_onEventAdd(e) {
		if (!this.chunks) return;

		let o = this.chunks[0];
		let components = o.components;
		let offset = o.len;
		let idx = e.idx;
		let ev = e.item;
		let muted = this._isMuted(ev);
		let i = components.length;

		while (i-- && idx < offset) {
			let comp = components.atIndex(i);
			if (comp instanceof CharLogMuted) {
				offset -= comp.length;
			} else {
				offset--;
			}
		}
		i++;

		o.len++;

		if (muted) {
			// Add muted event to the correct CharLogMuted,
			// or create a new CharLogMuted no adjecent is available.
			let c = components.atIndex(i);
			if (c instanceof CharLogMuted) {
				c.addEvent(ev, idx - offset);
			} else {
				c = components.atIndex(i - 1);
				if (c instanceof CharLogMuted) {
					c.addEvent(ev, c.length);
				} else {
					components.add(new CharLogMuted(this.module, this.char, this.mutedCtx, [ ev ]), i);
				}
			}
		} else {
			if (idx > offset) {
				// [TODO] Split the CharLogMuted component into two, and insert
				// this event in between. Now we just put it in front.
				i++;
			}
			components.add(this.module.self.getLogEventComponent(this.char.id, ev), i);
		}
	}

	_isMuted(ev) {
		return !!(ev.mod && ev.mod.muted);
	}

	_onLogClick(c, ev) {
		if (this.mutedCtx.tip) {
			this.mutedCtx.tip.close();
		}
	}

	atBottom() {
		return !!(this.simpleBar && this.simpleBar.atBottom);
	}
}

export default CharLogComponent;
