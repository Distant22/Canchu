const app = require("./app");
const port = process.env.NODE_ENV !== 'test' ? 3000 : 0

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


module.exports = server;
