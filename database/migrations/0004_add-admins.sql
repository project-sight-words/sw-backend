CREATE TABLE admins (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_by  UUID,
  CONSTRAINT fk_users FOREIGN KEY (updated_by) REFERENCES users (id)
);

CREATE TABLE admin_user (
  user_id     UUID         NOT NULL UNIQUE,
  admin_id    UUID         NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by  UUID,
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID,
  PRIMARY KEY (user_id, admin_id),
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_admins FOREIGN KEY (admin_id) REFERENCES admins (id),
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT fk_deleted_by FOREIGN KEY (deleted_by) REFERENCES users (id)
);
