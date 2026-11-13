import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Owner: Sadat.  Table: users (+ the shared helper set_updated_at() that every table with updated_at uses).
 * Should-level tables (auth_tokens, refresh_tokens) are not built yet. They can come in a LATER migration.
 */
export class CreateUsers1730000000001 implements MigrationInterface {
  name = "CreateUsers1730000000001";

  public async up(q: QueryRunner): Promise<void> {
    // Keeps updated_at correct on every table that has it.
    await q.query(`
      CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    await q.query(`CREATE TYPE user_role AS ENUM ('RENTER', 'OWNER', 'ADMIN')`);
    await q.query(`CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED')`);

    await q.query(`
      CREATE TABLE users (
        id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role              user_role   NOT NULL,
        full_name         varchar(80) NOT NULL,
        email             varchar(254) NOT NULL,
        phone             varchar(11)  NOT NULL,
        password_hash     text        NOT NULL,
        status            user_status NOT NULL DEFAULT 'ACTIVE',
        email_verified_at timestamptz,
        created_at        timestamptz NOT NULL DEFAULT now(),
        updated_at        timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT users_email_key UNIQUE (email),
        CONSTRAINT users_phone_key UNIQUE (phone),
        CONSTRAINT users_email_lowercase CHECK (email = lower(email)),
        CONSTRAINT users_phone_format CHECK (phone ~ '^01[3-9][0-9]{8}$')
      )
    `);
    await q.query(`CREATE INDEX users_role_status_idx ON users (role, status)`);
    await q.query(`
      CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at()
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS users`);
    await q.query(`DROP TYPE IF EXISTS user_status`);
    await q.query(`DROP TYPE IF EXISTS user_role`);
    await q.query(`DROP FUNCTION IF EXISTS set_updated_at()`);
  }
}
