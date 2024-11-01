import Err from 'classes/Err';

/**
 * File handles file uploads.
 */
class File {

	constructor(app, params) {
		this.app = app;
		this.apiFilePath = app.props.apiFilePath;
	}

	/**
	 * Uploads a file to the upload endpoint.
	 * @param {string|Blob|File} file File to upload.
	 * @param {string} rid Upload endpoint resource ID.
	 * @returns {Promise.<{ uploadId: string, filename: string, size: number, mime: string}>} Promise of upload info.
	 */
	upload(file, rid) {
		return new Promise((resolve, reject) => {
			let formData = new FormData();
			formData.append('file', file);

			let url = this.apiFilePath + rid.replace(/\./g, '/');
			let xhr = new XMLHttpRequest();
			xhr.withCredentials = true;
			xhr.open('POST', url, true);

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						let result = JSON.parse(xhr.response);
						resolve(result);
					} catch (e) {
						reject(new Err('file.invalidJson', "Error parsing json response: {message}", { message: e.message }));
					}
				} else {
					reject(new Err('file.uploadFailed', "Upload failed with status {status}", { status: xhr.status }));
				}
			};
			xhr.onerror = () => {
				reject(new Err('file.uploadFailed', "Upload failed with status {status}: {statusText}", { status: xhr.status, statusText: xhr.statusText }));
			};
			xhr.send(formData);
		});
	}

	dispose() {}
}

export default File;
