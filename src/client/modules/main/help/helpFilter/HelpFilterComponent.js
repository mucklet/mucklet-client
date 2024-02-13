import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>The <em>Awake</em> list in the far-left <em>Realm</em> panel may be filtered to help find characters you are looking for.
	In the <em>Search filter</em> input, type in the name, gender, species, tag, or idle status you wish to match.</p>
	<p class="common--formattext"><code class="charlog--code-inline">male</code> will match any character set as male.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Idle status</h4>
	<p class="common--formattext"><code class="charlog--code-inline">active</code>, <code class="charlog--code-inline">idle</code> and <code class="charlog--code-inline">away</code> will match characters on idle status.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Multiple criteria</h4>
	<p>To match multiple critera, separate them using comma (,).</p>
	<p class="common--formattext"><code class="charlog--code-inline">female, public roleplay</code> will match female characters with a "public roleplay" tag.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Set of critera alternatives</h4>
	<p>Separating a set of critera with pipe (|) will match characters fulfilling at least one of the alternatives in the set.</p>
	<p class="common--formattext"><code class="charlog--code-inline">wolf | werewolf | timberwolf</code> will match characters with the species matching either "wolf", "werewolf", or "timberwolf".</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Negative criteria</h4>
	<p>Putting an exclamation mark (!) in front of a criteria, will match characters who does not fulfil that criteria.</p>
	<p class="common--formattext"><code class="charlog--code-inline">!away</code> will match characters with an idle status not set to away.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Disliked tags</h4>
	<p>Putting a tilde (~) in front of a criteria, will match characters with a matching dislike tag.</p>
	<p class="common--formattext"><code class="charlog--code-inline">~males</code> will match characters who have a dislike "males" tag.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Complex critera</h4>
	<p>The above syntax forms may be combined into more complex filters.</p>
	<p class="common--formattext"><code class="charlog--code-inline">male, !~private roleplay, wolf|fox</code> will match male wolf or fox characters without a dislike "private roleplay" tag.</p>
</section>`;

class HelpFilterComponent extends Html{
	constructor(module) {
		super(l10n.l('helpFilter.helpDesc', helpText), { className: 'helpfilter' });
	}
}

export default HelpFilterComponent;
