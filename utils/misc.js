const nanoid = require("nanoid");

module.exports = {
  generateString: function () {
    const nanoidFunc = nanoid.customAlphabet("abcdefghijklmnopqrstuvwxyz123456789");
    return nanoidFunc(6);
  },
};
