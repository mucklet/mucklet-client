import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Your title as Pioneer is a thanks to those who have been around since the early days, and to those taking an active part in helping with the game and the community. And it also comes with benefits!</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Pioneer benefits</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Early access</td><td>Access to new or experimental features. We all love experiments, right?</td></tr>
		<tr><td class="charlog--strong">Increased caps</td><td>Permission to create more characters, rooms, areas, etc.</td></tr>
		<tr><td class="charlog--strong">Pioneer tag</td><td>Exclusive access to use the <em>pioneer</em> title tag. Woohoo!</td></tr>
	</tbody></table>
</section>`;

class HelpPioneerComponent extends Html{
	constructor(module) {
		super(l10n.l('helpPioneer.helpDesc', helpText), { className: 'helppioneer' });
	}
}

export default HelpPioneerComponent;
