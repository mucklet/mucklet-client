import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Thanks for your help developing and maintaining the realm!</p>
	<p>Being a <em>builder</em> means you are free to create, delete and edit things like rooms, exits, or areas, without the requirement of ownership. You also have access to a few additional commands to help you out.</p>
	<p>Use this power wisely.</p>
</section>`;

class HelpBuilderComponent extends Html{
	constructor(module) {
		super(l10n.l('helpBuilder.helpDesc', helpText), { className: 'helpbuilder' });
	}
}

export default HelpBuilderComponent;
