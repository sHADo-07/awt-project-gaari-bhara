import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";

let counter = 0;

export interface TestUser {
  id: string;
  token: string;
  email: string;
  phone: string;
  role: string;
}

/** Names may not have digits, so the number 12 becomes letters ("Bc"). */
const letters = (n: number) =>
  String(n).split("").map((d) => "ABCDEFGHIJ"[Number(d)]).join("");

/** Signs up a new user through the real API, then logs in. */
export async function registerUser(app: INestApplication, role: "OWNER" | "RENTER", name = "Test User"): Promise<TestUser> {
  counter += 1;
  const email = `user${counter}-${Date.now()}@example.com`;
  const phone = `0171${String(2000000 + counter).slice(-7)}`;
  const http = request(app.getHttpServer());
  const reg = await http.post("/auth/register").send({ fullName: `${name} ${letters(counter)}`, email, phone, password: "Secret1234", role });
  if (reg.status !== 201) throw new Error(`register failed: ${reg.status} ${JSON.stringify(reg.body)}`);
  const login = await request(app.getHttpServer()).post("/auth/login").send({ email, password: "Secret1234" });
  return { id: reg.body.id, token: login.body.accessToken, email, phone, role };
}

/** Admins cannot sign up. The seeder creates them, so the test inserts one and logs in. */
export async function createAdmin(app: INestApplication, db: DataSource): Promise<TestUser> {
  counter += 1;
  const email = `admin${counter}-${Date.now()}@example.com`;
  const phone = `0172${String(3000000 + counter).slice(-7)}`;
  const hash = await bcrypt.hash("Admin1234", 10);
  const rows = await db.query(
    `INSERT INTO users (role, full_name, email, phone, password_hash) VALUES ('ADMIN', 'Test Admin', $1, $2, $3) RETURNING id`,
    [email, phone, hash],
  );
  const res = await request(app.getHttpServer()).post("/auth/login").send({ email, password: "Admin1234" });
  return { id: rows[0].id, token: res.body.accessToken, email, phone, role: "ADMIN" };
}

export const bearer = (u: { token: string }) => ({ Authorization: `Bearer ${u.token}` });
