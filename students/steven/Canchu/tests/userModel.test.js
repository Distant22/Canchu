const app = require('../server');
const request = require("supertest");
const util = require('../utils/util')
require("dotenv").config();

var token; 

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
    token = res.body.data.access_token;
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

describe("GET /api/1.0/users/407/profile", () => {
  it("should get profile", async () => {

    const res = await request(app)
    .get("/api/1.0/users/407/profile")
    .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});

describe("PUT /api/1.0/users/profile", () => {
  it("should signup", async () => {

    const res = await request(app)
    .put("/api/1.0/users/profile")
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: util.generateRandomString(5),
      introduction: util.generateRandomString(10),
      tags: util.generateRandomString(5)
    });
    expect(res.statusCode).toBe(200);
  });
});