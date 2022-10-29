import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>The <em>Awake</em> list in the far-left <em>Realm</em> panel may be filtered to help find characters you are looking for.
	In the <em>Search filter</em> input, type in the name, gender, species, or tag you wish to match.</p>
	<p class="common--formattext"><code class="charlog--code-inline">male</code> will match any character set as male.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Multiple criteria</h4>
	<p>To match multiple critera, separate them using comma (,).</p>
	<p class="common--formattext"><code class="charlog--code-inline">female, public roleplay</code> will match female characters with a "public roleplay" tag.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Set of critera alternatives</h4>
	<p>Separating a set of critera with slash (/) or pipe (|) will match characters fulfilling at least one of the alternatives in the set.</p>
	<p class="common--formattext"><code class="charlog--code-inline">wolf / werewolf / timberwolf</code> will match characters with the species matching either "wolf", "werewolf", or "timberwolf".</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Negative criteria</h4>
	<p>Putting an exclamation mark (!) in front of a criteria, will match characters who does not fulfil that criteria.</p>
	<p class="common--formattext"><code class="charlog--code-inline">!gmt timezone</code> will match characters who does not have the "gmt timezone" tag.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Complex critera</h4>
	<p>The above syntax forms may be combined into more complex filters.</p>
	<p class="common--formattext"><code class="charlog--code-inline">male, !private roleplay, wolf/fox</code> will match male wolf or fox characters without the "private roleplay" tag.</p>
</section>`;

class HelpFilterComponent extends Html{
	constructor(module) {
		super(l10n.l('helpFilter.helpDesc', helpText), { className: 'helpfilter' });
	}
}

export default HelpFilterComponent;
