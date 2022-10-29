import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ScreenDialog from 'components/ScreenDialog';
import escapeHtml from 'utils/escapeHtml';
import formatDate from 'utils/formatDate';
import PoliciesBody from './PoliciesBody';
import './policies.scss';

const availablePolicies = {
	'privacy': true,
	'terms': true,
};

/**
 * Policies draws the main login wireframe
 */
class Policies {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'screen' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	openPolicy(policy) {
		if (!availablePolicies[policy]) {
			console.error("Unknown policy:", policy);
			return;
		}

		let url = escapeHtml('/policies/' + policy + '.json');
		fetch(url)
			.then(response => response.json())
			.then(data => {
				let close = () => this.module.screen.removeSubcomponent(policy);
				this.module.screen.addSubcomponent(policy, new ScreenDialog(
					new Elem(n => n.elem('div', [
						n.component(data.created
							? new Txt(l10n.t('policies.lastUpdate', "Last update {date}", { date: formatDate(new Date(data.created), { showYear: true }) }), {
								tagName: 'span',
								className: 'policies--subtitle'
							})
							: null
				 		),
						n.component(new PoliciesBody(this.module, data.body, { className: 'policies--body' })),
						n.elem('button', {
							events: { click: close },
							className: 'policies--btn btn large primary'
						}, [
							n.component(new Txt(l10n.l('policies.close', "Close")))
						])
					])),
					{
						size: 'wide',
						title: data.title,
						close
					}
				));
			});
	}

	dispose() {
		this.model.off('change', this._onModelChange);
		this._onUnsubscribe();
	}
}

export default Policies;
