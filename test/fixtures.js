const app = require('../app');

exports.mochaGlobalTeardown = function () {
  app.stop();
};
