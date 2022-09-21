CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid()
);

CREATE TABLE user_admin (
  user_id     UUID         REFERENCES users(id),
  admin_id    UUID         REFERENCES admins(id),
  created_at  TIMESTAMPTZ,
  created_by  UUID         REFERENCES users(id),
  deleted_at  TIMESTAMPTZ,
  deleted_by  UUID         REFERENCES users(id),
  CONSTRAINT user_admin_pk PRIMARY KEY (user_id, admin_id)
);

CREATE UNIQUE INDEX unique_user_id_admin_id 
ON user_admin (user_id, admin_id)
WHERE deleted_at IS NULL;
