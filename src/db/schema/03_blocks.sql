DROP TABLE IF EXISTS blocks CASCADE;

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  hashed_password VARCHAR(255)
);