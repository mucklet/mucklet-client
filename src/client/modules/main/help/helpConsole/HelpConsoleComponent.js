import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>The console is used to issue all commands. But there is more to it.</p>
</section>
<section class="charlog--pad">
	<h4>Color coding</h4>
	<p>The editor will show the text in different colors as you type. This is to give you hints whether the text you are typing is a valid <span class="charlog--cmd">command</span> or <span class="charlog--cmd">attribute</span>, a valid value such as an exit <span class="charlog--listitem">keyword</span> or character <span class="charlog--listitem">name</span>, or if it is an <span class="charlog--error">error</span>.</p>
</section>
<section class="charlog--pad">
	<h4>Character tabs</h4>
	<p>The tabs on top of the console shows all awake characters you are controlling. Switch between characters by clicking on them. Click on currently active character to have them look at themselves.</p>
</section>
`;


class HelpConsoleComponent {
	constructor(module, shortcuts) {
		this.module = module;
		this.shortcuts = shortcuts.toArray();
	}

	render(el) {
		let list = [];
		for (let m of this.shortcuts) {
			list.push('<tr><td class="helpconsole--usage">' + m.usage + '</td><td>' + l10n.t(m.desc) + '</td></tr>');
		}
		this.elem = new Elem(n => n.elem('div', { className: 'helpconsole' }, [
			n.component(new Html(l10n.l('helpConsole.helpDesc', helpText), { className: 'help--desc' })),
			n.component(new Txt(l10n.l('help.helpShortcuts', "Keyboard shortcuts"), { tagName: 'h4', className: 'charlog--pad' })),
			n.elem('div', { className: 'charlog--pad' }, [
				n.elem('table', { className: 'tbl tbl-nomargin' }, [
					n.component(new Html(list.join(''), { tagName: 'tbody' })),
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

export default HelpConsoleComponent;
