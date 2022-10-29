import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Thanks for your help moderating the realm, keeping it a friendly and safe place for everyone!</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Moderator etiquette</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;calm</td><td>When someone is abusive (even to you), always stay calm and polite.</td></tr>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;fair</td><td>Warnings and penalties should always be based on rules and moderator policies, not opinions and personal preferences.</td></tr>
		<tr><td class="charlog--strong">Always&nbsp;be&nbsp;helpful</td><td>Some rule concepts can be tricky (eg. <em>powerplay</em>). Help by explaining the rules to new or confused players.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Penalties</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">Warning</td><td>Send a private warning message using the <code class="charlog--code-simple">warn</code> command. If not obvious, explain what they should stop doing, and warn them that they otherwise might get suspended. It is okay for them to argue back as long is it is not abusive.</td></tr>
		<tr><td class="charlog--strong">Suspend</td><td>Suspend a character for a while using the <code class="charlog--code-simple">suspend</code> command. The duration is automatically set for an hour, a day, or a week, depending on previous suspension of that player's characters. The penalty period which increases suspend duration is reset after a maximum of 2 weeks.</td></tr>
		<tr><td class="charlog--strong">Lock out</td><td>A player with 2 suspended characters will automatically get locked out until at least one of the characters is released from suspension.</td></tr>
		<tr><td class="charlog--strong">Ban</td><td>Ban a player from the realm using the <code class="charlog--code-simple">ban player</code> command. A banned player can no longer connect to the realm with their account.</td></tr>
	</tbody></table>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Policies</h4>
	<table class="tbl-small tbl-nomargin charlog--font-small"><tbody>
		<tr><td class="charlog--strong">On first infraction</td><td>If a player breaks a rule, start with a polite <span class="charlog--strong">Warning</span>.</td></tr>
		<tr><td class="charlog--strong">On unheeded warnings</td><td>If a player continues to break the rules, maybe becoming verbally abusive, <span class="charlog--strong">Suspend</span> their character.</td></tr>
		<tr><td class="charlog--strong">On repeated infractions</td><td>If a player returns with another character (which is fine) to break the rules (which is not fine), <span class="charlog--strong">Suspend</span> that character too.</td></tr>
		<tr><td class="charlog--strong">On severe infractions</td><td>If a player intentionally and repeatedly or severely breaks the rules, <span class="charlog--strong">Ban</span> them.</td></tr>
		<tr><td class="charlog--strong">On lockout/ban bypass</td><td>If a player who is locked out or banned returns with a new account, <span class="charlog--strong">Ban</span> the new account.</td></tr>
		<tr><td class="charlog--strong">On new account infractions</td><td>If a player uses a new account with the intention of breaking the rules (not applied to "newbies"), <span class="charlog--strong">Ban</span> them.</td></tr>
	</tbody></table>
</section>`;

class HelpModerateComponent extends Html{
	constructor(module) {
		super(l10n.l('helpModerate.helpDesc', helpText), { className: 'helpmoderate' });
	}
}

export default HelpModerateComponent;
