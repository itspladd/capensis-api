/* Remove all unterminated sessions (i.e. end_time is null)
   EXCEPT for the most recent session of each user
   (so that we don't remove any sessions that are
   supposed to still be running)
 */
DELETE FROM sessions AS big_s
WHERE (id < (
  SELECT MAX(s.id) FROM sessions AS s
  WHERE s.user_id = big_s.user_id))
  AND end_time IS NULL;