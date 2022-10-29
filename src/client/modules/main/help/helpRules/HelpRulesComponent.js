import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<h4 class="charlog--pad">Player Etiquette</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Be&nbsp;nice</td><td>Be nice to other players. Some may have poor grammar or spelling. Some may have low quality descriptions or images. Some may be new to roleplaying. You might not want to roleplay with them, but you can still be nice and polite towards them.</td></tr>
		<tr><td class="charlog--strong">Be&nbsp;clear</td><td class="common--formattext">If you are not interested in playing with someone, or if something is bothering you, it is best to tell them nicely but clearly instead of ignoring them. Use <span class="ooc">((out of character text))</span> for extra clarification.</td></tr>
		<tr><td class="charlog--strong">Be&nbsp;respectful</td><td>Be respectful to others. If someone tells you they are busy or not interested, respect their wishes. It is never fun to be ignored or discarded, but we have no right to anyone elses time or attention. Move on and try finding some other wanton lad or lass.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Rules</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">No&nbsp;illegal&nbsp;activity</td><td>Any illegal activity, or using the realm to plan illegal activities, will result in a ban.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;illegal&nbsp;content</td><td>Uploading illegal content, or linking to illegal content, will result in a ban.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;minors</td><td>Players must be 18 years of age or older. Younger players will get banned.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;spamming</td><td>Spamming a room or a character, or causing other intentional disruptions may get you suspended or banned.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;harassment</td><td>Harassing someone, including continuing to contact them even when they've told you to stop, may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;abuse</td><td>Abusive, hateful, or severly disrespectful communication may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;inflammatory&nbsp;topics</td><td>Pushing inflammatory out-of-character topics such as religion or politics may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;public&nbsp;toxicity</td><td>Creating a poor roleplay environment by venting negative emotions in public areas may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;identity&nbsp;theft</td><td>Representing yourself as another player's character or as a moderator may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;player&nbsp;reveal</td><td>Revealing or without consent trying to obtain private information about a player or their characters may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;bypass&nbsp;account</td><td>Creating an account to bypass a ban or a suspend lockout will get the new account banned.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;lawless&nbsp;account</td><td>Creating an account for the purpose of breaking any of these rules will result in a ban.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;underaged&nbsp;humans</td><td>Sexual roleplay with underaged human characters may get you suspended.</td></tr>
		<tr><td class="charlog--strong">No&nbsp;pornographic&nbsp;images</td><td>Uploading sexually suggestive or explicit photos of real people may get you suspended.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Realm specific rules</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">No&nbsp;canon&nbsp;characters</td><td>Roleplaying real people, established figures, or characters created or owned by someone else is not allowed.</td></tr>
		<tr><td class="charlog--strong">English&nbsp;only</td><td>While characters may occasionally use other languages, communication should be kept in English.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Area specific rules</h4>
	<p class="charlog--font-small">Different areas may have additional rules. See the area's Rules section, or type:</p>
	<section class="charlog--pad">
		<div class="charlog--code"><code>area rules</code></div>
	</section>
</section>`;

class HelpRulesComponent extends Html{
	constructor(module) {
		super(l10n.l('helpRules.helpDesc', helpText), { className: 'helprules' });
	}
}

export default HelpRulesComponent;
