import l10n from 'modapp-l10n';

const txtCardBrands = {
	amex: l10n.l('txtCardBran.amex', "American Express"),
	diners: l10n.l('txtCardBran.diners', "Diners Club"),
	discover: l10n.l('txtCardBran.discover', "Discover"),
	jcb: l10n.l('txtCardBran.jcb', "Japan Credit Bureau"),
	mastercard: l10n.l('txtCardBran.mastercard', "MasterCard"),
	unionpay: l10n.l('txtCardBran.unionpay', "China UnionPay"),
	visa: l10n.l('txtCardBran.visa', "Visa"),
	unknown: l10n.l('txtCardBran.unknown', "Unknown"),
};

/**
 * Returns the locale string of a card brand.
 * @param {string} brand Brand.
 * @returns {LocaleString} Brand as locale string.
 */
export function toLocaleString(brand) {
	return txtCardBrands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
};
