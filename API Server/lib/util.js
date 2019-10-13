/**
 * Utility Functions
 */

const crypto = require("crypto");
const uuidv1 = require('uuid/v1');

/**
 * Generate Unique ID
 */
exports.generateUUID = () => {
    return uuidv1()
}

/**
 * Generate Salt
 */
exports.generateRandomString = (len) => {
    return crypto.randomBytes(len).toString('base64');
}

/**
 * Hash SHA512
 */
exports.hash = (str) => {
    const hash = crypto.createHash('sha512');
    data = hash.update(str, 'utf-8');
    return data.digest('base64');
}

/**
 * Hash Password
 */
exports.hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`base64`);
}

/**
 * Validate Password
 */
exports.validatePassword = (password) => {
    var re = /^.{6,}$/;         // minimum 6 chars
    return re.test(password)
}

/**
 * Validate Email
 */
exports.validateEmail = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}