import l10n from 'modapp-l10n';


const txtCurrencies = {
	usd: cost => l10n.l('txtCurrency.usdCost', "${cost}", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
	eur: cost => l10n.l('txtCurrency.eurCost', "€{cost}", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
	sek: cost => l10n.l('txtCurrency.sekCost', "{cost} kr", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") }),
};

const txtUnknown = cost => l10n.l('txtCurrency.unknownCost', "{cost} cash", { cost: (cost / 100).toFixed(2).replace(/[.,]00$/, "") });

/**
 * Returns the locale string of a currency and a cost.
 * @param {string} currency Currency.
 * @param {number} cost Cost in smallest unit (such as cents, öre, etc).
 * @returns {LocaleString} Currency as locale string.
 */
export function toLocaleString(currency, cost) {
	return (txtCurrencies[currency] || txtUnknown)(cost);
};
