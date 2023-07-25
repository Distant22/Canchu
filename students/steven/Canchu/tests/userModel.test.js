const app = require('../server');
const request = require("supertest");
require("dotenv").config();

afterAll((done) => {
  app.close(() => {
    done();
  });
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
