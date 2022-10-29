import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Below is a list of commands available to administrate the realm. Good luck and have fun!</p>
</section>`;

class HelpAdminComponent extends Html{
	constructor(module) {
		super(l10n.l('helpAdmin.helpDesc', helpText), { className: 'helpadmin' });
	}
}

export default HelpAdminComponent;
