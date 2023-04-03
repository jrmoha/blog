import express from 'express';
import config from './config/config';
const app = express();
const port = config.PORT;

app.get('/', (req, res) => {
  let s = 'Hello World';
  s = `bye`;
  console.log(s);
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
