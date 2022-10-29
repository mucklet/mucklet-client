import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Thanks for your help in making other players feel welcome and less confused!</p>
	<p><div class="chartagslist--item" style="display:inline-block"><div title="Helper of this realm." class="chartagslist--tag title hasdesc"><span>helper</span></div></div> is a title tag that can be added to your character(s) to make it easier for others to know who to ask for help:</p>
	<div class="charlog--code"><code>add tag helper</code></div>` +
`</section>`;

class HelpHelperComponent extends Html{
	constructor(module) {
		super(l10n.l('helpHelper.helpDesc', helpText), { className: 'helphelper' });
	}
}

export default HelpHelperComponent;
