import type { AuthError } from '@supabase/supabase-js'

const authErrorMessages: Record<string, string> = {
  invalid_credentials: 'メールアドレスまたはパスワードが正しくありません',
  user_already_exists: 'このメールアドレスは既に登録されています',
  email_not_confirmed: 'メールアドレスが確認されていません',
  user_not_found: 'ユーザーが見つかりません',
  over_request_rate_limit: 'リクエスト回数の上限に達しました。しばらくしてから再試行してください',
  weak_password: 'パスワードが脆弱です。より強力なパスワードを設定してください',
  same_password: '新しいパスワードは現在のパスワードと異なる必要があります',
  validation_failed: '入力内容に誤りがあります',
  otp_expired: '確認コードの有効期限が切れています',
  signup_disabled: '現在、新規登録は無効になっています',
  email_exists: 'このメールアドレスは既に使用されています',
  phone_exists: 'この電話番号は既に使用されています',
  flow_state_not_found: '認証フローが無効です。もう一度お試しください',
  flow_state_expired: '認証フローの有効期限が切れています。もう一度お試しください',
  email_address_not_authorized: 'このメールアドレスは許可されていません',
  email_provider_disabled: 'メールによる認証は無効になっています',
  unexpected_failure: '予期しないエラーが発生しました',
}

export function getAuthErrorMessage(error: AuthError): string {
  if (error.code && error.code in authErrorMessages) {
    return authErrorMessages[error.code]
  }
  const details = [error.code, error.message].filter(Boolean).join(': ')
  if (details) {
    return `エラーが発生しました: ${details}`
  }
  return 'エラーが発生しました。もう一度お試しください'
}

export function getAuthErrorMessageByCode(code: string): string {
  return authErrorMessages[code] ?? 'エラーが発生しました。もう一度お試しください'
}
