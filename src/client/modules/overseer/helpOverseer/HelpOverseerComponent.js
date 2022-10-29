import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Below is a list of commands available to the overseer. Use them wisely.</p>
</section>`;

class HelpOverseerComponent extends Html{
	constructor(module) {
		super(l10n.l('helpOverseer.helpDesc', helpText), { className: 'helpoverseer' });
	}
}

export default HelpOverseerComponent;
