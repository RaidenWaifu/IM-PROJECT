const app = require('./src/app');
const { port } = require('./src/config');

app.listen(port, () => {
  console.log(`IM Project backend listening on http://localhost:${port}`);
});
