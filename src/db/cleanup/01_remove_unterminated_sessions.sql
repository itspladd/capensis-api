DELETE FROM sessions AS big_s
WHERE (id < (
  SELECT MAX(s.id) FROM sessions AS s
  WHERE s.user_id = big_s.user_id))
  AND end_time IS NULL;