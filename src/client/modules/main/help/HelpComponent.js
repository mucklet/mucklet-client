import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';


class HelpComponent extends Html {
	constructor(module, categories) {
		categories = categories.toArray().filter(m => m.promoted);

		let list = [];
		for (let m of categories) {
			list.push('<tr><td><code class="common--nowrap">help ' + escapeHtml(m.cmd) + '</code></td><td>' + escapeHtml(l10n.t(m.shortDesc || m.title)) + '</td></tr>');
		}

		super(`<h3 class="margin-bottom-m">${l10n.t('help.help', "Welcome to Wolfery")}</h3>
<div class="help--desc">
	<section class="charlog--pad">
		<p>${l10n.t('help.helpIntro', "This is a social game of roleplaying with characters blissfully unaware of the real world.")}</p>
		<p>${l10n.t('help.helpIntro2', "Most things are done by typing commands in the <em>console</em>, like you just did (well done!). You can try to say hello by typing:")}</p><section class="charlog--pad">
			<div class="charlog--code"><code>${l10n.t('help.cmdSay', "say Hello!")}</code></div>
		</section>
		<p>${l10n.t('help.introHelpme', "Quickest way to get help is to chat with our helpers, by typing:")}</p>
		<section class="charlog--pad">
			<div class="charlog--code"><code>${l10n.t('help.cmdHelpme', "helpme Hi! I am new here.")}</code></div>
		</section>
		<p>${l10n.t('help.helpTopicsIntro', "If you prefer learning by yourself, you can try some other help topics:")}</p>
		<section class="charlog--pad">
			<div class="charlog--code">
				<table class="tbl-small tbl-nomargin">
					<tbody>${list.join('')}</tbody>
				</table>
			</div>
		</section>
		<p>To view a full list of help topics, type:</p>
		<section class="charlog--pad">
			<div class="charlog--code"><code>help topics</code></div>
		</section>
	</section>
</div>`, { className: 'help' });

	}
}

export default HelpComponent;
