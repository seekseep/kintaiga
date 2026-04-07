# サービス一覧

## Executor（実行者）の種類

| 型 | 説明 |
|----|------|
| UserExecutor | 認証済みユーザー。`user.id` と `user.role`（admin / general）を持つ |
| OrganizationExecutor | 組織コンテキスト付きユーザー。UserExecutor の情報に加え `organization.id`、`organization.role`（owner / manager / member）、`organization.plan`（free / premium）を持つ |
| SystemExecutor | システム内部処理用。権限チェックなし |
| なし | Executor 不要（公開エンドポイント） |

## 権限関数

| 関数 | 許可される条件 |
|------|--------------|
| `canActAsAdmin` | system admin |
| `canModifyUser` | system admin / 本人 |
| `canChangeRole` | system admin |
| `canCreateActivityForUser` | system admin / 本人 |
| `canActAsOrganizationOwner` | system admin / org owner |
| `canActAsOrganizationManager` | system admin / org owner / org manager |
| `canManageOrganizationMembers` | = `canActAsOrganizationManager` |
| `canManageOrganizationProjects` | = `canActAsOrganizationManager` |
| `canTransferOwnership` | system admin / org owner |
| `canControlActivityInOrganization` | system admin / org owner / org manager / 本人 |
| `canCreateReport` | `canActAsOrganizationManager` + premium プラン |

---

## サービス一覧

### プロフィール（profile）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| getProfile | UserExecutor | なし | 自分のプロフィールを取得 |
| createProfile | UserExecutor | なし | 初回プロフィール作成（名前・メール） |
| updateProfile | UserExecutor | なし | 自分のプロフィール（名前）を更新 |
| updateIcon | UserExecutor | なし | 自分のアイコンをアップロード |

### 組織（organizations）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| createOrganization | UserExecutor | なし | 組織を作成し、作成者を owner として追加 |
| getOrganizationByName | なし | なし | 組織名から組織情報を取得 |
| updateOrganization | OrganizationExecutor | `canActAsOrganizationManager` | 組織名・表示名を更新 |
| deleteOrganization | OrganizationExecutor | `canActAsOrganizationManager` | 組織を削除 |
| listOrganizationMembers | OrganizationExecutor | なし | 組織メンバー一覧を取得 |
| addOrganizationMember | OrganizationExecutor | `canManageOrganizationMembers` | メールアドレスでユーザーを組織に追加 |
| removeOrganizationMember | OrganizationExecutor | `canManageOrganizationMembers` | 組織からメンバーを除外（owner は除外不可） |
| updateOrganizationMemberRole | OrganizationExecutor | `canActAsOrganizationOwner` | メンバーの組織権限を変更 |
| transferOwnership | OrganizationExecutor | `canTransferOwnership` | 組織のオーナーを別メンバーに移譲 |

### ユーザー管理（users）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| listUsers | OrganizationExecutor | なし | 組織内ユーザー一覧を取得 |
| getUser | OrganizationExecutor | なし | ユーザー詳細を取得 |
| createUser | OrganizationExecutor | `canActAsAdmin` | ユーザーを新規作成（system admin のみ） |
| updateUser | OrganizationExecutor | `canModifyUser` | ユーザー情報（名前）を更新（admin / 本人） |
| updateUserRole | OrganizationExecutor | `canActAsAdmin` | ユーザーのシステム権限を変更（system admin のみ） |
| archiveAndDeleteUser | OrganizationExecutor | `canModifyUser` | ユーザーをアーカイブ・削除（admin / 本人） |

### プロジェクト（projects）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| listUserProjectStatements | OrganizationExecutor | `canActAsOrganizationManager`（フィルタ用） | プロジェクト一覧を取得。manager 以上は全件、member は参加中のみ |
| getProject | OrganizationExecutor | なし | プロジェクト詳細を取得 |
| createProject | OrganizationExecutor | `canManageOrganizationProjects` | プロジェクトを新規作成 |
| updateProject | OrganizationExecutor | `canManageOrganizationProjects` | プロジェクト設定を更新（名前・説明・丸め・集計） |
| deleteProject | OrganizationExecutor | `canManageOrganizationProjects` | プロジェクトを削除 |
| getProjectConfiguration | OrganizationExecutor | なし | プロジェクト設定を取得（組織デフォルトで補完） |
| listProjectMembers | OrganizationExecutor | なし | プロジェクトのメンバー一覧を取得 |

### 稼働（activities）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| listActivities | OrganizationExecutor | `canActAsOrganizationManager`（フィルタ用） | 稼働一覧を取得。manager 以上は全件、member は自分のみ |
| getActivity | OrganizationExecutor | `canControlActivityInOrganization` | 稼働詳細を取得 |
| createActivity | OrganizationExecutor | `canActAsOrganizationManager`（他人分の作成時） | 稼働を作成。本人分は全員可、他人分は manager 以上 |
| updateActivity | OrganizationExecutor | `canControlActivityInOrganization` | 稼働を更新（開始・終了日時、メモ） |
| deleteActivity | OrganizationExecutor | `canControlActivityInOrganization` | 稼働を削除 |

### 配属（assignments）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| listAssignments | OrganizationExecutor | なし | 配属一覧を取得（プロジェクト・ユーザーでフィルタ可） |
| getAssignment | OrganizationExecutor | なし | 配属詳細を取得 |
| createAssignment | OrganizationExecutor | `canActAsOrganizationManager` | ユーザーをプロジェクトに配属 |
| updateAssignment | OrganizationExecutor | `canActAsOrganizationManager` | 配属期間を更新 |
| deleteAssignment | OrganizationExecutor | `canActAsOrganizationManager` | 配属を削除 |

### 組織設定（organization-configuration）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| getConfiguration | OrganizationExecutor | なし | 組織設定を取得（未作成時は自動作成） |
| updateConfiguration | OrganizationExecutor | `canActAsOrganizationManager` | 組織設定を更新（丸め間隔・方向、集計単位・期間） |

### レポート（reports）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| createReport | OrganizationExecutor | `canCreateReport` | 稼働レポートを作成（manager 以上 + premium プラン） |
| getReportByPublicId | なし | なし | 公開IDでレポートを取得（認証不要） |
| listReports | OrganizationExecutor | `canActAsOrganizationManager` | レポート一覧を取得 |
| deleteReport | OrganizationExecutor | `canActAsOrganizationManager` | レポートを削除 |

### トークン（tokens）

| サービス | Executor | 権限 | 説明 |
|----------|----------|------|------|
| createToken | OrganizationExecutor | メンバーシップ確認 + admin チェック | API アクセス用トークンを発行 |
| listTokens | OrganizationExecutor | なし | 自分のトークン一覧を取得 |
| revokeToken | OrganizationExecutor | トークン所有者 / admin | トークンを失効させる |
| resolveToken | なし | トークン検証（ハッシュ + 有効期限） | トークン文字列から OrganizationExecutor を復元 |
