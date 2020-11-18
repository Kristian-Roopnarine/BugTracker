const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'Congrats!',
    message: 'Testing node',
  });
});

module.exports = app;
