import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Thank you for financially supporting the development, operations, and marketing of the game! And apart from earning our gratitude, it also comes with a few benefits!</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Supporter benefits</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Additional features</td><td>Access to upcoming features such as multiple profile images, custom client addons, or bot tokens.</td></tr>
		<tr><td class="charlog--strong">Increased caps</td><td>Permission to create more characters, rooms, areas, etc.</td></tr>
		<tr><td class="charlog--strong">Supporter tag</td><td>Exclusive access to use the <em>supporter</em> title tag. Woohoo!</td></tr>
	</tbody></table>
</section>`;

class HelpSupporterComponent extends Html{
	constructor(module) {
		super(l10n.l('helpSupporter.helpDesc', helpText), { className: 'helpsupporter' });
	}
}

export default HelpSupporterComponent;
