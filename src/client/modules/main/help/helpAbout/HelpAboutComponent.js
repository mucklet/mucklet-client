import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Welcome to Sinder, a city built in the midst of the rift.
	Although <em>built</em> is probably not the right word.
	It rather started to exist as pieces of realities lost in
	the tides of the rifts was brought together like a patch of shipwreck
	debris, creating this small existance inside the storm.</p>
	<p>It is still a world in its infancy, shaped by those who live there.
	Anyone who stepped out of the yellow train is welcome be a part of it
	and help it evolve.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">The players and the characters</h4>
	<p>The world is created for the purpose of role playing.
	Everything is done through characters and with characters.
	The players controlling them are less relevant, and it is completely fine
	to ignore out-of-character questions like a/s/l (Age? Sex? Location?).</p>
	<p>So let the conflicts and strife of real life be put aside, and take
	the moment to be whoever and whatever you'd like.</p>
</section>`;

class HelpAboutComponent extends Html{
	constructor(module) {
		super(l10n.l('helpAbout.helpDesc', helpText), { className: 'helpabout' });
	}
}

export default HelpAboutComponent;
