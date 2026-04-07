WITH suspect AS (
  SELECT u.id, u.email, u.name
  FROM public.users u
  LEFT JOIN auth.users a ON a.id = u.id
  WHERE a.id IS NULL
     OR u.email IN (
       SELECT email FROM public.users
       WHERE email IS NOT NULL
       GROUP BY email
       HAVING COUNT(*) > 1
     )
)
SELECT s.id::text AS user_id,
       s.email,
       s.name,
       (a.id IS NOT NULL) AS in_auth,
       (SELECT COUNT(*) FROM organization_assignments    WHERE user_id = s.id) AS org_assignments,
       (SELECT COUNT(*) FROM project_assignments         WHERE user_id = s.id) AS proj_assignments,
       (SELECT COUNT(*) FROM project_activities          WHERE user_id = s.id) AS activities,
       (SELECT COUNT(*) FROM personal_access_tokens      WHERE user_id = s.id) AS pats,
       (SELECT COUNT(*) FROM reports                     WHERE user_id = s.id) AS reports
FROM suspect s
LEFT JOIN auth.users a ON a.id = s.id
ORDER BY s.email NULLS LAST, s.id;
