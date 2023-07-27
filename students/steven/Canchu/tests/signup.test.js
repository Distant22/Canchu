process.env.NODE_ENV = "test";
const app = require('../app');
const server = require('../server');
const request = require("supertest");
const util = require('../utils/util')

require("dotenv").config();

afterAll((done) => {
  if (server) {
    server.close(() => {
      done();
    });
  }
});

// Signup｜測試成功情況（200）
describe("POST /api/1.0/users/signup", () => {
  it("Signup｜測試成功情況（200）", async () => {

    const res = await request(app)
    .post("/api/1.0/users/signup")
    .set('X-Forwarded-For', '127.0.0.1')
    .send({
      name: util.generateRandomString(8),
      password: "123",
      email: util.generateRandomString(5)+"@gmail.com",
    });
    expect(res.statusCode).toBe(200);
  });
});

// Signup｜測試欄位缺失情況（400）
describe("POST /api/1.0/users/signup", () => {
  it("Signup｜測試欄位缺失情況（400）", async () => {

    const res = await request(app)
    .post("/api/1.0/users/signup")
    .set('X-Forwarded-For', '127.0.0.1')
    .send({
      name: util.generateRandomString(8),
      password: "123",
    });
    expect(res.statusCode).toBe(400);
  });
});

// Signup｜測試信箱格式出錯情況（400）
describe("POST /api/1.0/users/signup", () => {
  it("Signup｜測試信箱格式出錯情況（400）", async () => {

    const res = await request(app)
    .post("/api/1.0/users/signup")
    .set('X-Forwarded-For', '127.0.0.1')
    .send({
      name: util.generateRandomString(8),
      password: "123",
      email: util.generateRandomString(8)
    });
    expect(res.statusCode).toBe(400);
  });
});

// Signup｜測試Email已被使用情況（403）
describe("POST /api/1.0/users/signup", () => {
  it("Signup｜測試Email已被使用情況（403）", async () => {

    const res = await request(app)
    .post("/api/1.0/users/signup")
    .set('X-Forwarded-For', '127.0.0.1')
    .send({
      name: util.generateRandomString(8),
      password: "123",
      email: "Steven@gmail.com",
    });
    expect(res.statusCode).toBe(403);
  });
});

