# AGENTS.md

勤怠管理アプリケーション「Kintaiga」のAIエージェント向けガイドライン。

## テックスタック

- Next.js 15 (App Router) / React 19 / TypeScript 5.9
- PostgreSQL + Drizzle ORM
- Supabase 認証 + JWT (jose)
- Zod バリデーション / Formik フォーム
- TanStack Query (データ取得) / TanStack Table
- shadcn/ui (Radix UI + Tailwind CSS 4)
- Vitest テスト / oxlint リンター

## コマンド

```bash
pnpm dev              # 開発サーバー
pnpm build            # プロダクションビルド
pnpm test             # テスト実行
pnpm test:watch       # テスト監視モード
pnpm lint             # oxlint (ESLint ではない)
pnpm db:generate      # マイグレーション生成
pnpm db:migrate       # マイグレーション実行
pnpm db:studio        # DB GUI
```

**パッケージマネージャーは pnpm を使うこと。npm / yarn は使わない。**

## ディレクトリ構成

```
src/
├── app/            # Next.js App Router (ページ・APIルート)
├── api/            # クライアント側 API 関数 (axios)
├── components/     # UI コンポーネント (shadcn/ui ベース)
├── domain/         # ドメインロジック (認可・集計・時間計算など)
├── hooks/          # カスタムフック (api/, ui/)
├── lib/            # ユーティリティ (api-server/, query-client など)
├── schemas/        # Zod スキーマ定義
└── services/       # ビジネスロジック (サービス層)
db/
├── schema.ts       # Drizzle テーブル定義 (単一ファイル)
├── relations.ts    # Drizzle リレーション定義
└── migrations/     # マイグレーションファイル
```

## アーキテクチャルール

### サービス層

サービス関数は `src/services/{エンティティ}/{アクション}/index.ts` に配置する。

```typescript
// シグネチャパターン
export async function createProject(
  dependencies: { db: DbOrTx },
  executor: OrganizationExecutor,
  input: CreateProjectInput,
) { ... }
```

- 第1引数: 依存 (`{ db }`)
- 第2引数: 実行者 (`Executor` または `OrganizationExecutor`)
- 第3引数: 入力データ
- 関数の先頭で Zod バリデーション → 認可チェック → DB 操作の順で処理する

### 認可

二層の認可モデルを採用している:

| レベル | 権限 | 型 |
|---|---|---|
| システム | `admin`, `general` | `Executor` |
| 組織 | `owner`, `manager`, `member` | `OrganizationExecutor` |

- 認可関数は `src/domain/authorization/` に定義
- サービス層で DB 操作の前に必ず認可チェックを行う

### バリデーション

- Zod スキーマでバリデーション定義
- `z.input<>` (シリアライズ型) と `z.output<>` (ランタイム型) を区別する
- `safeParse` で検証し、失敗時は `ValidationError` を投げる

### エラーハンドリング

カスタムエラークラスを使用:
- `ValidationError` - バリデーション失敗
- `ForbiddenError` - 認可エラー
- `NotFoundError` - リソース未発見
- `HttpError` - その他 HTTP エラー

API ルートでは `withErrorHandler()` でラップして統一的にシリアライズする。

## テスト規約

- テストファイルは対象と同じディレクトリに `index.test.ts` として配置
- **describe / it の説明は日本語で書く**
- テストヘルパーは `src/services/testing/helpers.ts` にある
  - `createAdminExecutor()`, `createGeneralExecutor()`
  - `createOwnerExecutor()`, `createManagerExecutor()`, `createMemberExecutor()`
  - `createMockDb()` (Drizzle クエリのモック)

```typescript
// テスト例
describe('createProject', () => {
  it('owner はプロジェクトを作成できる', async () => {
    const db = createMockDb({ insertResult: [expected] })
    const result = await createProject({ db }, createOwnerExecutor(), input)
    expect(result).toMatchObject({ name: 'Test' })
  })
})
```

## パスエイリアス

- `@/*` → `./src/*`
- `@db/*` → `./db/*`

## やってはいけないこと

- npm / yarn を使う (pnpm のみ)
- ESLint を使う (oxlint を使用)
- `db/schema.ts` を分割する (単一ファイルで管理)
- 認可チェックを省略する
- テストの説明を英語で書く
