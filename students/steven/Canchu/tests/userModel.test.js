const app = require('../server');
const request = require("supertest");
const util = require('../utils/util')
require("dotenv").config();

afterAll((done) => {
  if (app) {
    app.close(() => {
      done();
    });
  }
});

describe("POST /api/1.0/users/signin", () => {
  it("should signin", async () => {

    const res = await request(app).post("/api/1.0/users/signin").send({
      email: "Steven@gmail.com",
      password: "123",
      provider: "native",
    });
    expect(res.statusCode).toBe(200);
  });
});

describe("POST /api/1.0/users/signup", () => {
  it("should signup", async () => {

    const res = await request(app).post("/api/1.0/users/signup").send({
      name: util.generateRandomString(8),
      password: "123",
      email: util.generateRandomString(5)+"@gmail.com",
    });
    expect(res.statusCode).toBe(200);
  });
});