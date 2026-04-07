-- 重複・孤立 users 行のクリーンアップ
-- 調査結果は scripts/sql/investigate-suspect-user-references.result.txt 参照
--
-- 方針:
--   1. seekseep+2@gmail.com の重複ペアは、orphan aadc8ab1 (yokoyama) の
--      organization_assignments を生きてる d8b37408 (よこやま２) に張り替える
--      (張り替え先は org_assignments=0 なので unique 制約衝突なし)
--   2. orphan users 4 行を削除。残り 3 件の依存参照は ON DELETE CASCADE で自動消去
--      (FK: db/schema.ts L29, L86, L98 など)

-- 1. seekseep+2@gmail.com 重複の参照張り替え
UPDATE organization_assignments
SET user_id = 'd8b37408-f817-4679-b8d1-164644cc513e'  -- よこやま２ (in auth)
WHERE user_id = 'aadc8ab1-5746-44fd-a4f5-20a9fcbb037b'; -- yokoyama (orphan)

-- 2. orphan users をまとめて削除 (依存テーブルは CASCADE)
DELETE FROM public.users WHERE id IN (
  'ba83e346-b86d-40ec-b7ad-f856d5e702fe', -- 坂本 (sakamoto@mococo.tech, refs=0)
  'aadc8ab1-5746-44fd-a4f5-20a9fcbb037b', -- yokoyama (seekseep+2, refs moved)
  'b6c76ab4-f457-4689-a749-38b362af7570', -- テスト (null email)
  'd92aab28-feb4-498c-954a-a6b02a98402b'  -- よこやま (null email)
);
