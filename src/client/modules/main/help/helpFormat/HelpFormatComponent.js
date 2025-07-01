import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const url = escapeHtml(window.location.href.split('?')[0].replace(/\/+$/, '') + '/siteicon.svg');
const helpText =
`<section class="charlog--pad">
	<p>Texts such as communication may be formatted to better express meaning.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Formatting</h4>
	<p class="common--formattext"><code class="charlog--code-inline">**bold**</code> will produce <strong>bold</strong> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">_italic_</code> will produce <em>italicized</em> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">++superscript++</code> will produce <sup>superscripted</sup> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">--subscript--</code> will produce <sub>subscripted</sub> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">~~strikethrough~~</code> will produce <s>strikethrough</s> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">((ooc))</code> will produce <span class="ooc">((out of character))</span> text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">\`command\`</code> will produce <span class="cmd">command</span> example text.</p>
	<p class="common--formattext"><code class="charlog--code-inline">https://example.com</code> will produce a clickable <a target="_blank" rel="noopener noreferrer">link</a>.</p>
	<p class="common--formattext"><code class="charlog--code-inline">[Link name](https://example.com)</code> will produce a clickable <a target="_blank" rel="noopener noreferrer">named link</a>.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Examples</h4>
	<div class="charlog--pad">
		<div class="charlog--code">
			<table class="tbl-small tbl-nomargin"><tbody>
				<tr><td><code>say I will **never** give up!</code></td><td class="common--formattext"><span class="charlog--char">John</span> says, "I will <strong>never</strong> give up!"</td></tr>
				<tr><td><code>desc The room is _freezing_ cold.</code></td><td>⌈The room is <em>freezing</em> cold.⌋</td></tr>
				<tr><td><code>pose hears a high pitched ++beep beep++.</code></td><td class="common--formattext"><span class="charlog--char">Jane</span> hears a high pitched <sup>beep beep</sup>.</span></td></tr>
				<tr><td><code>pose 's stomach rumbles. --Growl--</code></td><td class="common--formattext"><span class="charlog--char">John</span>'s stomach rumbles. <sub>Growl</sub></span></td></tr>
				<tr><td><code>pose writes a note: "I ~~like~~ love you."</td><td class="common--formattext"><span class="charlog--char">Jane</span> writes a note: "I <s>like</s> love you."</td></tr>
				<tr><td><code>pose dozes off. ((Phonecall. BRB))</code></td><td class="common--formattext"><span class="charlog--char">John</span> dozes off. <span class="ooc">((Phonecall. BRB))</span></td></tr>
				<tr><td><code>ooc :suggests typing: \`help\`</code></td><td class="common--formattext"><span class="charlog--char">Jane</span> <span class="charlog--tag">ooc </span><span class="charlog--ooc"> suggests typing: <span class="cmd">help</span></span></td></tr>
				<tr><td><code>ooc Ref img: ` + url + `</code></td><td class="common--formattext"><span class="charlog--char">John</span> <span class="charlog--tag">ooc </span><span class="charlog--ooc"> says, "Ref img: <a href="` + url + `" target="_blank" rel="noopener noreferrer">` + url + `</a>"</span></td></tr>
				<tr><td><code>ooc :referred to [this image](` + url + `)</code></td><td class="common--formattext"><span class="charlog--char">Jane</span> <span class="charlog--tag">ooc </span><span class="charlog--ooc"> referred to <a href="` + url + `" target="_blank" rel="noopener noreferrer">this image</a></span></td></tr>
			</tbody></table>
		</div>
	</div>
</section>

<section class="charlog--pad">
	<h4 class="charlog--pad">Info field formatting</h4>
	<p>For additional formatting available for info fields, such as descriptions, about sections, and rules, type:</p>
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>help format info</code><br>
		</div>
	</div>
</section>`;

class HelpFormatComponent extends Html{
	constructor(module) {
		super(l10n.l('helpFormat.helpFormatDesc', helpText), { className: 'helpformat' });
	}
}

export default HelpFormatComponent;
