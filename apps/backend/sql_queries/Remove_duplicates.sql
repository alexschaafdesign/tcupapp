SELECT date, venue, headliner, time, COUNT(*)
FROM "shows"
GROUP BY date, venue, headliner, time
HAVING COUNT(*) > 1;

WITH duplicates AS (
    SELECT ctid, ROW_NUMBER() OVER (
        PARTITION BY date, venue, headliner, time
        ORDER BY id
    ) AS row_num
    FROM "shows"
)
DELETE FROM "shows"
WHERE ctid IN (
    SELECT ctid
    FROM duplicates
    WHERE row_num > 1
);