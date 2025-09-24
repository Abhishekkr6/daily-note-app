// __tests__/auth.test.js
import request from "supertest";
import app from "../src/app"; // Your Next.js/Express app entry

describe("Auth Flows", () => {
  it("should signup, verify email, and login", async () => {
    const email = `test${Date.now()}@example.com`;
    const password = "Test@1234";
    // Signup
    const signupRes = await request(app)
      .post("/api/users/signup")
      .send({ username: "testuser", email, password, confirmPassword: password, csrfToken: "dummy" });
    expect(signupRes.status).toBe(200);
    // Simulate email verification (get token from DB)
    // ...fetch token from DB and call /api/users/verify-email
    // Login
    const loginRes = await request(app)
      .post("/api/users/login")
      .send({ email, password, csrfToken: "dummy" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  it("should not login with wrong password", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: "wrong@example.com", password: "wrong", csrfToken: "dummy" });
    expect(res.status).toBe(400);
  });

  // Add more tests for refresh, logout, 2FA, etc.
});
