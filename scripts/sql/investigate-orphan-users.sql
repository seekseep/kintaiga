SELECT u.id,
       u.email,
       u.name,
       u.created_at
FROM public.users u
LEFT JOIN auth.users a ON a.id = u.id
WHERE a.id IS NULL
ORDER BY u.created_at;
