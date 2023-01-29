import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Thanks for your help in making other players feel welcome and less confused!</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Helper etiquette</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;friendly</td><td>We have all been roleplay beginners at one point. Be friendly and lenient when helping and guiding other players.</td></tr>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;patient</td><td>The commands, the GUI, and the RP concepts are tricky for many. Be patient with those trying to learn.</td></tr>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;respectful</td><td>When someone behaves poorly, be respectful in return. And report those who become abusive.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Helper tag</h4>
	<p><div class="chartagslist--item" style="display:inline-block"><div title="Helper of this realm." class="chartagslist--tag title hasdesc"><span>helper</span></div></div> is a title tag that can be added to your character(s) to make it easier for others to know who to ask for help:</p>
	<div class="charlog--code"><code>add tag helper</code></div>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Help requests</h4>
	<p>The medkit-icon in the Realm panel will show help requests sent by players. Make sure to assign a help ticket to yourself before handling it, to avoid confusion between helpers.</p>
	<p>And if you try to summon or join them, remember to send them a friendly message first, letting them know you are responding to their request for help.</p>
</section>`;

class HelpHelperComponent extends Html{
	constructor(module) {
		super(l10n.l('helpHelper.helpDesc', helpText), { className: 'helphelper' });
	}
}

export default HelpHelperComponent;
