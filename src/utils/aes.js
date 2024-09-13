import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("1234567890123456");
const iv = CryptoJS.enc.Utf8.parse("1234567890123456");

export const encrypt = (data, worksideKey) => {
	const key = CryptoJS.enc.Utf8.parse(worksideKey);

	return CryptoJS.AES.encrypt(data, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
};

export const decrypt = (data, worksideKey) => {
	const key = CryptoJS.enc.Utf8.parse(worksideKey);

	return CryptoJS.AES.decrypt(data, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString(CryptoJS.enc.Utf8);
};
