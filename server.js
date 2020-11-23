const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception. Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './.env' });
const app = require('./app');

const dbString =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL_URL
    : process.env.DATABASE_TEST_URL;

mongoose
  .connect(dbString, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Connection successful'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection');
  server.close(() => {
    process.exit(1);
  });
});
