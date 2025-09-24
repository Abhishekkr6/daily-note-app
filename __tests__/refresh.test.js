// __tests__/refresh.test.js
import request from "supertest";
import app from "../src/app";

describe("Refresh Token Flow", () => {
  it("should issue new access/refresh tokens with valid refresh token", async () => {
    // Simulate login to get refresh token
    const email = `test${Date.now()}@example.com`;
    const password = "Test@1234";
    await request(app)
      .post("/api/users/signup")
      .send({ username: "testuser", email, password, confirmPassword: password, csrfToken: "dummy" });
    // ...simulate email verification
    const loginRes = await request(app)
      .post("/api/users/login")
      .send({ email, password, csrfToken: "dummy" });
    const cookies = loginRes.headers["set-cookie"];
    // Call refresh endpoint with cookie
    const refreshRes = await request(app)
      .post("/api/users/refresh-token")
      .set("Cookie", cookies)
      .send();
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
  });

  it("should reject invalid or missing refresh token", async () => {
    const res = await request(app)
      .post("/api/users/refresh-token")
      .send();
    expect(res.status).toBe(401);
  });
});
