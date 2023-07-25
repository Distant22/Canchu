const app = require('../server');
const request = require("supertest");
const mysql = require('mysql2/promise');
require("dotenv").config();

describe("POST /api/1.0/users/signin", () => {
  it("should signin", async () => {

    const db = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'user'
    });

    const res = (await request(app).post("/api/1.0/users")).send({
      email: "Steven@gmail.com",
      password: "123",
      provider: "native",
    });
    expect(res.statusCode).toBe(200);
  });
});
