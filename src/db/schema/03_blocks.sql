DROP TABLE IF EXISTS blocks CASCADE;

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL
);