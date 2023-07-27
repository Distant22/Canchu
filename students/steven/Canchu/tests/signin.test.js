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

// Signin｜測試成功情況（200）
describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試成功情況（200）", async () => {

        const res = await request(app)
        .post("/api/1.0/users/signin")
        .set('X-Forwarded-For', '127.0.0.1')
        .send({
            email: "Steven@gmail.com",
            password: "123",
            provider: "native",
        });
        expect(res.statusCode).toBe(200);
        // token = res.body.data.access_token;
    });
});
  
  // Signin｜測試Provider未提供情況（400）
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試Provider未提供情況（400）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: "Steven@gmail.com",
        password: "123"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  
  // Signin｜測試Provider提供錯誤情況（403）
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試Provider提供錯誤情況（403）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: "Steven@gmail.com",
        password: "123",
        provider: "wrong",
      });
      expect(res.statusCode).toBe(403);
    });
  });
  
  // Signin｜測試臉書登入未提供Token情況（400）
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試臉書登入未提供Token情況（400）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        provider: "facebook"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  
  // Signin｜測試沒有密碼/Email情況（400）
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試沒有密碼情況（400）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: "Steven@gmail.com",
        provider: "native"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試沒有Email情況（400）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        password: "123",
        provider: "native"
      });
      expect(res.statusCode).toBe(400);
    });
  });
  
  // Signin｜測試密碼錯誤情況（403）
  describe("POST /api/1.0/users/signin", () => {
    it("Signin｜測試密碼錯誤情況（403）", async () => {
  
      const res = await request(app)
      .post("/api/1.0/users/signin")
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        email: "Steven@gmail.com",
        password: "dhcldskcdskc",
        provider: "native",
      });
      expect(res.statusCode).toBe(403);
    });
  });