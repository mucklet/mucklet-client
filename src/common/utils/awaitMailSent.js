import { isResError } from 'resclient';

/**
 * Awaits a mail object to be sent.
 * If the mail object is null, it will directly resolve.
 * @param {Model?} mail Mail response model.
 * @returns {Promise} Promise of mail being sent.
 */
export default function awaitMailSent(mail) {
	if (!mail) return Promise.resolve();

	if (isResError(mail)) {
		return Promise.reject(mail);
	}

	if (mail.error) {
		return Promise.reject(mail.error);
	}

	if (mail.sent) {
		return Promise.resolve();
	}

	return new Promise((resolve, reject) => {
		let onChange = () => {
			if (mail.sent) {
				if (mail.error) {
					reject(mail.error);
				} else {
					resolve();
				}
				mail.off('change', onChange);
			}
		};
		mail.on('change', onChange);
	});
}
