import { MigrationInterface, QueryRunner } from "typeorm";
export class AddPostModerationAndImageConstraints1730000000007 implements MigrationInterface {
  name = "AddPostModerationAndImageConstraints1730000000007";

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE posts ADD COLUMN hidden_from_status post_status`);
    await q.query(`ALTER TABLE posts ADD COLUMN hidden_reason varchar(300)`);
    await q.query(`UPDATE posts SET hidden_from_status = 'ACTIVE' WHERE status = 'HIDDEN'`);
    await q.query(`
      ALTER TABLE posts ADD CONSTRAINT posts_hidden_consistent CHECK (
        (status = 'HIDDEN') = (hidden_from_status IS NOT NULL)
        AND (hidden_from_status IS NULL OR hidden_from_status IN ('ACTIVE', 'CLOSED'))
      )`);

    await q.query(`
      CREATE OR REPLACE FUNCTION assign_post_image_position()
      RETURNS trigger AS $$
      BEGIN
        IF NEW.position IS NULL THEN
          SELECT gs.pos
          INTO NEW.position
          FROM generate_series(0, 4) AS gs(pos)
          WHERE NOT EXISTS (
            SELECT 1
            FROM post_images pi
            WHERE pi.post_id = NEW.post_id
              AND pi.position = gs.pos
          )
          ORDER BY gs.pos
          LIMIT 1;

          IF NEW.position IS NULL THEN
            RAISE EXCEPTION 'A post can have at most 5 images';
          END IF;
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await q.query(`
      CREATE TRIGGER post_images_assign_position
      BEFORE INSERT OR UPDATE OF position ON post_images
      FOR EACH ROW EXECUTE FUNCTION assign_post_image_position()
    `);

    await q.query(`
      UPDATE post_images i SET position = n.pos
        FROM (SELECT id, (row_number() OVER (PARTITION BY post_id ORDER BY created_at, id) - 1)::smallint AS pos
                FROM post_images) n
       WHERE i.id = n.id`);
    await q.query(`ALTER TABLE post_images ALTER COLUMN position DROP DEFAULT`);
    await q.query(`ALTER TABLE post_images ADD CONSTRAINT post_images_position_range CHECK (position BETWEEN 0 AND 4)`);
    await q.query(`ALTER TABLE post_images ADD CONSTRAINT post_images_position_unique UNIQUE (post_id, position)`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TRIGGER IF EXISTS post_images_assign_position ON post_images`);
    await q.query(`DROP FUNCTION IF EXISTS assign_post_image_position()`);
    await q.query(`ALTER TABLE post_images DROP CONSTRAINT IF EXISTS post_images_position_unique`);
    await q.query(`ALTER TABLE post_images DROP CONSTRAINT IF EXISTS post_images_position_range`);
    await q.query(`ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_hidden_consistent`);
    await q.query(`ALTER TABLE posts DROP COLUMN IF EXISTS hidden_reason`);
    await q.query(`ALTER TABLE posts DROP COLUMN IF EXISTS hidden_from_status`);
  }
}
