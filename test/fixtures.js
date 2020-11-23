const app = require('./app');
const port = 3000;
exports.mochaGlobalSetup = function () {
  this.server = app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
  });
};

exports.mochaGlobalTeardown = function () {
  this.server.close(() => {
    console.log('Closing server..');
  });
};
