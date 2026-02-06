WITH duplicates AS (
  SELECT 
    MIN(id) AS keep_id, -- Keep the row with the smallest id (or any other criterion you prefer)
    headliner,
    start
  FROM "shows"
  GROUP BY headliner, start
  HAVING COUNT(*) > 1 -- Only consider rows with duplicates
)
DELETE FROM "shows"
WHERE id NOT IN (SELECT keep_id FROM duplicates)
  AND (headliner, start) IN (SELECT headliner, start FROM duplicates);