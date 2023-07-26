/*
1.The response should have a status code of 200.
2.The response should return a token.
3.The response should return a user object with 2 fields, email and subscription, both having data type String.
*/
const app = require("../app");
require("dotenv").config();
const mongoose = require("mongoose");
const { DB_HOST, PORT = 3000 } = process.env;

const request = require("supertest");
const {
  expect,
  test,
  describe,
  beforeAll,
  afterAll,
} = require("@jest/globals");

describe("Test login function", () => {
  let response;
  let server;

  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST)
      .then(() => {
        console.log("Database connection successful");
        server = app.listen(PORT, () => {
          console.log("Server running. Use our API on port: 3000");
        });
      })
      .catch((err) => {
        console.log(`Server not running. Error message: ${err.message}`);
        process.exit(1);
      });

    response = await request(app).post("/users/login").send({
      email: "hannatill@gmail.com",
      password: "123456789",
    });
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  test("status code should be 200", async () => {
    expect(response.status).toBe(200);
  });
  test("should return a token", async () => {
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.token).toBe("string");
  });
  test("should return a user object with 2 fields, email and subscription, both having data type String", async () => {
    const {
      body: { user },
    } = response;

    expect(user).toBeDefined();
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("subscription");

    const { email, subscription } = response.body.user;

    expect(typeof email).toBe("string");
    expect(typeof subscription).toBe("string");
  });
});
