/**
 * Created by swxy on 2017/6/29.
 */

const crypto = require('crypto');

const secret = 'hello, world';

module.exports = {
        encrypt: function (str) {
            const cipher = crypto.createCipher('aes192', secret);
            let enc = cipher.update(str, 'utf8', 'hex');
            enc += cipher.final('hex');
            return enc;
        },
        decrypt: function (str) {
            const decipher = crypto.createDecipher('aes192', secret);
            let dec = decipher.update(str, 'hex', 'utf8');
            dec += decipher.final('utf8');
            return dec;
        }
};