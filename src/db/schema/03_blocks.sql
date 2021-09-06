DROP TABLE IF EXISTS blocks CASCADE;

CREATE TABLE blocks (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);