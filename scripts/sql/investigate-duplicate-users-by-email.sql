SELECT email,
       COUNT(*) AS count,
       array_agg(id::text ORDER BY created_at) AS user_ids,
       array_agg(name ORDER BY created_at) AS names
FROM public.users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY email;
