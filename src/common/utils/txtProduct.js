import l10n from 'modapp-l10n';

const txtProducts = {
	supporter: l10n.l('txtProduct.supporter', "Supporter"),
};

const txtProductDescs = {
	supporter: l10n.l('txtProduct.supporterDesc', "Mucklet supporters not only help with the development and operations of the game, but also get perks, such as:"),
};

const txtProductPaidDescs = {
	supporter: l10n.l('txtProduct.supporterPaidDesc', "By being a Mucklet supporter, you have access to perks such as:"),
};

const txtProductPaidThanks = {
	supporter: l10n.l('txtProduct.supporterPaidThanks', "Thank you for supporting Mucklet!"),
};

const txtProductFeatures = {
	supporter: [
		{
			title: l10n.l('txtProduct.supporterTag', "Supporter tag"),
			desc: l10n.l('txtProduct.supporterTagDesc', "Add the supporter tag to any character"),
			longDesc: l10n.l('txtProduct.supporterTagDesc', "Add the supporter tag to any character."),
		},
		{
			title: l10n.l('txtProduct.increasedCharCap', "Increased character cap"),
			desc: l10n.l('txtProduct.increasedCharCapDesc', "Create up to 50 characters per realm"),
			longDesc: l10n.l('txtProduct.increasedCharCapDesc', "Create up to 50 characters per realm, instead of 5."),
		},
		{
			title: l10n.l('txtProduct.increasedProfileCap', "Increased profile cap"),
			desc: l10n.l('txtProduct.increasedProfileCapDesc', "Create up to 20 profiles per character or room"),
			longDesc: l10n.l('txtProduct.increasedProfileCapDesc', "Create up to 20 profiles per character or room, instead of 3."),
		},
		{
			title: l10n.l('txtProduct.instanceRooms', "Instance rooms"),
			desc: l10n.l('txtProduct.instanceRoomsDesc', "Create rooms hosting multiple instances"),
			longDesc: l10n.l('txtProduct.instanceRoomsDesc', "Create rooms and areas where characters can play in private instances."),
		},
		{
			title: l10n.l('txtProduct.botAccess', "Bot access"),
			desc: l10n.l('txtProduct.botAccessDesc', "Create and connect bot characters"),
			longDesc: l10n.l('txtProduct.botAccessDesc', "Connect your characters using bot tokens, and control them with scripts."),
		},
		{
			title: l10n.l('txtProduct.comingFeatures', "... and more"),
			desc: l10n.l('txtProduct.comingFeaturesDesc', "Upcoming supporter features"),
			longDesc: l10n.l('txtProduct.comingFeaturesDesc', "Get access to upcoming supporter features as they are added."),
		},
	],
};

/**
 * Returns the locale string of a product.
 * @param {string} product Product.
 * @returns {LocaleString} Product as locale string.
 */
export function toLocaleString(product) {
	return txtProducts[product] || product;
};

/**
 * Returns a description of a product.
 * @param {string} product Product.
 * @returns {LocaleString} Product description as locale string.
 */
export function description(product) {
	return txtProductDescs[product] || "";
};

/**
 * Returns a description of a product for someone who has paid for it.
 * @param {string} product Product.
 * @returns {LocaleString} Product paid description as locale string.
 */
export function paidDescription(product) {
	return txtProductPaidDescs[product] || "";
};

/**
 * Returns a thank you message of a product for someone who has paid for it.
 * @param {string} product Product.
 * @returns {LocaleString} Product paid description as locale string.
 */
export function paidThanks(product) {
	return txtProductPaidThanks[product] || "";
};

/**
 * Returns an array of product features.
 * @param {string} product Product.
 * @returns {Array.<object>} List of product features with { title: LocaleString, desc: LocaleString } objects..
 */
export function features(product) {
	return txtProductFeatures[product] || [];
}
