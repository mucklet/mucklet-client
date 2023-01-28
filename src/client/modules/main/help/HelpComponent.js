import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const helpText =
`<section class="charlog--pad">
	<p>This is a social game of roleplaying with characters blissfully unaware of the real world.</p>
	<p>Most things are done by typing commands in the <em>console</em>, like you just did (well done!). You can try to say hello by typing:</p>
	<section class="charlog--pad">
		<div class="charlog--code"><code>say Hello!</code></div>
	</section>
	<p>If you have questions, you can always get help from one of our helpers by typing:</p>
	<section class="charlog--pad">
		<div class="charlog--code"><code>request help = How do I play this game?</code></div>
	</section>
</section>
<section class="charlog--pad">
	<h4>Realm</h4>
	<p>The far left-side panel shows information about the realm. Here you can see which characters are currently awake. By using the icons at the top, you can open different panel pages; <em>Character Select</em>, <em>Watch For</em>, <em>Mail Inbox</em>, and more.</p>
<section>
<section class="charlog--pad">
	<h4>Character Info</h4>
	<p>The left-side panel shows the character you are currently looking at. By looking at your own character, the panel will show additional buttons for doing things like editing the character's appearance or teleporting your character.</p>
<section>
<section class="charlog--pad">
	<h4>Room Info</h4>
	<p>The right-side panel shows information about the current room, clickable exits you can use, and other characters inside the room. Clicking on a character will make you look at them. And if another character looks at you, a colored line will appear in front of their avatar.</p>
</section>
`;


class HelpComponent {
	constructor(module, categories) {
		this.module = module;
		this.categories = categories.toArray();
	}

	render(el) {
		let list = [];
		for (let m of this.categories) {
			list.push('<tr><td><code class="common--nowrap">help ' + escapeHtml(m.cmd) + '</code></td><td>' + escapeHtml(l10n.t(m.shortDesc || m.title)) + '</td></tr>');
		}
		this.elem = new Elem(n => n.elem('div', { className: 'help' }, [
			n.component(new Txt(l10n.l('help.help', "Welcome to Wolfery"), { tagName: 'h3', className: 'margin-bottom-m' })),
			n.component(new Html(l10n.l('help.helpDesc', helpText), { className: 'help--desc' })),
			n.component(new Txt(l10n.l('help.helpCategories', "Other help topics"), { tagName: 'h4', className: 'charlog--pad' })),
			n.elem('div', { className: 'charlog--pad' }, [
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(list.join(''), { tagName: 'tbody' })),
					]),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default HelpComponent;
