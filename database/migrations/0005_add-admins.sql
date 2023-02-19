CREATE TABLE admins (
  id          UUID         PRIMARY KEY             DEFAULT gen_random_uuid(),
);

CREATE TABLE admin_users (
  id          UUID         PRIMARY KEY             DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL UNIQUE         REFERENCES users (id),
  admin_id    UUID         NOT NULL UNIQUE         REFERENCES admins (id),
  created_at  TIMESTAMPTZ  NOT NULL                DEFAULT NOW(),
  created_by  UUID                                 REFERENCES users (id),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID                                 REFERENCES users (id),
  PRIMARY KEY (user_id, admin_id),
);

CREATE UNIQUE INDEX ON admin_users(user_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX ON admin_users(student_id) WHERE deleted_at IS NULL;
