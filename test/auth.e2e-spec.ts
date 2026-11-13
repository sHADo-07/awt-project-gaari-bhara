import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";
import { DataSource } from "typeorm";
import { createTestApp } from "./helpers/app";
import { openDb, resetDatabase } from "./helpers/db";
import { bearer, createAdmin, registerUser, TestUser } from "./helpers/api";
import { MailService } from "../src/mails/mail.service";

describe("Registration, login, logout, roles and users (e2e)", () => {
  let app: INestApplication;
  let db: DataSource;
  let admin: TestUser;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    await resetDatabase();
    app = await createTestApp();
    db = await openDb();
    admin = await createAdmin(app, db);
  });
  afterAll(async () => {
    await db.destroy();
    await app.close();
  });

  describe("register", () => {
    it("creates a user and returns the profile (never the password)", async () => {
      const res = await http().post("/auth/register").send({
        fullName: "Rahim Uddin", email: "Rahim@Example.com", phone: "+8801712345678", password: "Secret1234", role: "RENTER",
      });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ role: "RENTER", fullName: "Rahim Uddin", email: "rahim@example.com", phone: "01712345678", status: "ACTIVE" });
      expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
    });

    it("saves a bcrypt hash with at least 10 rounds, not the plain password", async () => {
      const rows = await db.query(`SELECT password_hash FROM users WHERE email = 'rahim@example.com'`);
      expect(rows[0].password_hash).toMatch(/^\$2[aby]\$(1[0-9]|[2-3][0-9])\$/);
      expect(rows[0].password_hash).not.toContain("Secret1234");
    });

    it("sends a welcome email", async () => {
      const spy = jest.spyOn(MailService.prototype, "sendWelcome");
      await registerUser(app, "OWNER");
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it("refuses the ADMIN role", async () => {
      const res = await http().post("/auth/register").send({
        fullName: "Bad Admin", email: "bad@example.com", phone: "01712345601", password: "Secret1234", role: "ADMIN",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("role must be OWNER or RENTER");
    });

    it("answers 400 and says which field failed; unknown fields are refused", async () => {
      const res = await http().post("/auth/register").send({ fullName: "A", email: "nope", phone: "123", password: "short", role: "RENTER", extra: 1 });
      expect(res.status).toBe(400);
      const text = res.body.message.join(" | ");
      for (const field of ["fullName", "email", "phone", "password", "extra"]) expect(text).toContain(field);
    });

    it("answers 409 for a duplicate email or phone", async () => {
      const a = await registerUser(app, "RENTER");
      const sameEmail = await http().post("/auth/register").send({ fullName: "Other Person", email: a.email, phone: "01799999991", password: "Secret1234", role: "RENTER" });
      expect(sameEmail.status).toBe(409);
      const samePhone = await http().post("/auth/register").send({ fullName: "Other Person", email: "other@example.com", phone: a.phone, password: "Secret1234", role: "RENTER" });
      expect(samePhone.status).toBe(409);
    });
  });

  describe("login", () => {
    it("logs in with the right password and returns a Bearer token", async () => {
      const res = await http().post("/auth/login").send({ email: "Rahim@Example.com", password: "Secret1234" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ tokenType: "Bearer", expiresIn: 3600, user: { email: "rahim@example.com" } });
      expect(res.body.accessToken.split(".")).toHaveLength(3);
    });

    it("gives the same 401 for a wrong password and an unknown email", async () => {
      const wrong = await http().post("/auth/login").send({ email: "rahim@example.com", password: "Wrong12345" });
      const unknown = await http().post("/auth/login").send({ email: "nobody@example.com", password: "Wrong12345" });
      expect(wrong.status).toBe(401);
      expect(unknown.status).toBe(401);
      expect(wrong.body.message).toBe(unknown.body.message);
    });

    it("answers 400 for an empty body", async () => {
      expect((await http().post("/auth/login").send({})).status).toBe(400);
    });
  });

  describe("the guard: protected routes", () => {
    it("401 without a token, with garbage, with a wrong scheme", async () => {
      expect((await http().get("/users/me")).status).toBe(401);
      expect((await http().get("/users/me").set("Authorization", "Bearer abc.def.ghi")).status).toBe(401);
      expect((await http().get("/users/me").set("Authorization", "abc")).status).toBe(401);
    });

    it("401 for an expired token and for a token signed with another secret", async () => {
      const u = await registerUser(app, "RENTER");
      const jwt = app.get(JwtService);
      const expired = await jwt.signAsync({ sub: u.id, roles: ["RENTER"] }, { expiresIn: -10 });
      expect((await http().get("/users/me").set("Authorization", `Bearer ${expired}`)).status).toBe(401);
      const forged = await new JwtService({ secret: "another-secret-another-secret" }).signAsync({ sub: u.id, roles: ["ADMIN"] });
      expect((await http().get("/admin/users").set("Authorization", `Bearer ${forged}`)).status).toBe(401);
    });

    it("401 when the user of a valid token was deleted", async () => {
      const u = await registerUser(app, "RENTER");
      await db.query(`DELETE FROM users WHERE id = $1`, [u.id]);
      expect((await http().get("/users/me").set(bearer(u))).status).toBe(401);
    });

    it("a valid token opens the route and every answer has an X-Request-Id", async () => {
      const u = await registerUser(app, "OWNER");
      const res = await http().get("/users/me").set(bearer(u));
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(u.id);
      expect(res.headers["x-request-id"]).toBeDefined();
    });

    it("403 when the role is not allowed", async () => {
      const renter = await registerUser(app, "RENTER");
      expect((await http().get("/admin/users").set(bearer(renter))).status).toBe(403);
    });

    it("every error has the same shape and no stack trace", async () => {
      const res = await http().get("/users/me");
      expect(Object.keys(res.body).sort()).toEqual(["error", "message", "path", "statusCode", "timestamp"]);
      expect(JSON.stringify(res.body)).not.toMatch(/at .*\.ts|node_modules/);
    });

    it("health stays public", async () => {
      expect((await http().get("/health")).status).toBe(200);
    });
  });

  describe("logout", () => {
    it("the token stops working at once; a new login works", async () => {
      const u = await registerUser(app, "RENTER");
      expect((await http().get("/users/me").set(bearer(u))).status).toBe(200);
      expect((await http().post("/auth/logout").set(bearer(u))).status).toBe(200);
      const after = await http().get("/users/me").set(bearer(u));
      expect(after.status).toBe(401);
      expect(after.body.message).toMatch(/logged out/i);
      const again = await http().post("/auth/login").send({ email: u.email, password: "Secret1234" });
      expect((await http().get("/users/me").set("Authorization", `Bearer ${again.body.accessToken}`)).status).toBe(200);
    });

    it("logout needs a token, and a second logout with the same token is 401", async () => {
      expect((await http().post("/auth/logout")).status).toBe(401);
      const u = await registerUser(app, "RENTER");
      await http().post("/auth/logout").set(bearer(u)).expect(200);
      expect((await http().post("/auth/logout").set(bearer(u))).status).toBe(401);
    });
  });

  describe("change password", () => {
    it("rejects a wrong current password (401), the same password (400) and a weak one (400)", async () => {
      const u = await registerUser(app, "RENTER");
      const put = (body: object) => http().patch("/auth/password").set(bearer(u)).send(body);
      expect((await put({ currentPassword: "Wrong12345", newPassword: "NewSecret5678" })).status).toBe(401);
      expect((await put({ currentPassword: "Secret1234", newPassword: "Secret1234" })).status).toBe(400);
      expect((await put({ currentPassword: "Secret1234", newPassword: "short" })).status).toBe(400);
    });

    it("changes the password: the old token and the old password stop working", async () => {
      const u = await registerUser(app, "OWNER");
      const res = await http().patch("/auth/password").set(bearer(u)).send({ currentPassword: "Secret1234", newPassword: "NewSecret5678" });
      expect(res.status).toBe(200);
      expect((await http().get("/users/me").set(bearer(u))).status).toBe(401);
      expect((await http().post("/auth/login").send({ email: u.email, password: "Secret1234" })).status).toBe(401);
      expect((await http().post("/auth/login").send({ email: u.email, password: "NewSecret5678" })).status).toBe(200);
    });
  });

  describe("my profile", () => {
    it("edits my name and phone", async () => {
      const u = await registerUser(app, "RENTER");
      const res = await http().patch("/users/me").set(bearer(u)).send({ fullName: "New Name", phone: "01811111111" });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ fullName: "New Name", phone: "01811111111" });
      expect((await http().get("/users/me").set(bearer(u))).body.fullName).toBe("New Name");
    });

    it("rejects a phone that is taken (409), a bad phone, an empty body, and email or role changes (400)", async () => {
      const a = await registerUser(app, "RENTER");
      const b = await registerUser(app, "RENTER");
      const patch = (body: object) => http().patch("/users/me").set(bearer(a)).send(body);
      expect((await patch({ phone: b.phone })).status).toBe(409);
      expect((await patch({ phone: "123" })).status).toBe(400);
      expect((await patch({})).status).toBe(400);
      expect((await patch({ role: "ADMIN" })).status).toBe(400);
      expect((await patch({ email: "x@example.com" })).status).toBe(400);
    });
  });

  describe("admin: users", () => {
    it("lists with filters and pages, and never shows a password hash", async () => {
      await registerUser(app, "OWNER", "Findable");
      const res = await http().get("/admin/users?role=OWNER&q=Findable&limit=5").set(bearer(admin));
      expect(res.status).toBe(200);
      expect(res.body.items.length).toBeGreaterThan(0);
      expect(res.body.items.every((u: any) => u.role === "OWNER")).toBe(true);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 5 });
      expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
      expect((await http().get("/admin/users?role=BOAT").set(bearer(admin))).status).toBe(400);
      expect((await http().get("/admin/users?limit=1000").set(bearer(admin))).status).toBe(400);
    });

    it("reads one user: 200, 404 for an unknown id, 400 for a bad id", async () => {
      const u = await registerUser(app, "RENTER");
      expect((await http().get(`/admin/users/${u.id}`).set(bearer(admin))).body.id).toBe(u.id);
      expect((await http().get("/admin/users/00000000-0000-4000-8000-000000000000").set(bearer(admin))).status).toBe(404);
      expect((await http().get("/admin/users/not-a-uuid").set(bearer(admin))).status).toBe(400);
    });

    it("suspend: the user gets 403 at login and with the old token; restore opens it again", async () => {
      const u = await registerUser(app, "RENTER");
      const s = await http().patch(`/admin/users/${u.id}/suspend`).set(bearer(admin));
      expect(s.status).toBe(200);
      expect(s.body.status).toBe("SUSPENDED");
      expect((await http().get("/users/me").set(bearer(u))).status).toBe(403);
      expect((await http().post("/auth/login").send({ email: u.email, password: "Secret1234" })).status).toBe(403);
      expect((await http().patch(`/admin/users/${u.id}/suspend`).set(bearer(admin))).status).toBe(409);
      const r = await http().patch(`/admin/users/${u.id}/restore`).set(bearer(admin));
      expect(r.body.status).toBe("ACTIVE");
      expect((await http().get("/users/me").set(bearer(u))).status).toBe(200);
    });

    it("an admin cannot suspend or delete themselves or another admin", async () => {
      const other = await createAdmin(app, db);
      expect((await http().patch(`/admin/users/${admin.id}/suspend`).set(bearer(admin))).status).toBe(400);
      expect((await http().patch(`/admin/users/${other.id}/suspend`).set(bearer(admin))).status).toBe(403);
      expect((await http().delete(`/admin/users/${admin.id}`).set(bearer(admin))).status).toBe(400);
      expect((await http().delete(`/admin/users/${other.id}`).set(bearer(admin))).status).toBe(403);
    });

    it("deletes a user with no records, and answers 409 when a post still uses the user", async () => {
      const free = await registerUser(app, "RENTER");
      expect((await http().delete(`/admin/users/${free.id}`).set(bearer(admin))).status).toBe(200);
      expect((await http().get(`/admin/users/${free.id}`).set(bearer(admin))).status).toBe(404);

      const owner = await registerUser(app, "OWNER");
      await db.query(
        `INSERT INTO posts (author_id, post_type, title, body, category_id, district_id) VALUES ($1, 'OFFER', 'A post', 'Text', 1, 1)`,
        [owner.id],
      );
      const res = await http().delete(`/admin/users/${owner.id}`).set(bearer(admin));
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/still used/);
    });

    it("only an admin can use the admin routes", async () => {
      const owner = await registerUser(app, "OWNER");
      for (const path of ["/admin/users", `/admin/users/${owner.id}`]) {
        expect((await http().get(path)).status).toBe(401);
        expect((await http().get(path).set(bearer(owner))).status).toBe(403);
      }
      expect((await http().delete(`/admin/users/${owner.id}`).set(bearer(owner))).status).toBe(403);
    });
  });
});
