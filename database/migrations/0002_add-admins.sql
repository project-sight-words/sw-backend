CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE admin_user (
  admin_id    UUID         REFERENCES admins(id),
  user_id     UUID         REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL,
  created_by  UUID         REFERENCES users(id),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID         REFERENCES users(id),
  CONSTRAINT admin_user_pk PRIMARY KEY (admin_id, user_id)
);

CREATE UNIQUE INDEX unique_admin_id_user_id 
ON admin_user (admin_id, user_id)
WHERE deleted_at IS NULL;
