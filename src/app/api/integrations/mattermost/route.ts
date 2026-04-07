import { type NextRequest } from 'next/server'
import { db } from '@/lib/api-server/db'
import { resolveUserToken } from '@/services/user/tokens'
import { getUser } from '@/services/user'
import {
  getOrganizationProjectByName,
  listOrganizationProjectStatements,
} from '@/services/organization/project'
import { createOrganizationProjectMemberActivity } from '@/services/organization/project/member/activity/createOrganizationProjectMemberActivity'
import { updateOrganizationProjectMemberActivity } from '@/services/organization/project/member/activity/updateOrganizationProjectMemberActivity'
import { listOrganizationProjectMemberActivities } from '@/services/organization/project/member/activity/listOrganizationProjectMemberActivities'
import { HttpError, NotFoundError } from '@/lib/api-server/errors'
import type { OrganizationExecutor } from '@/services/types'

function mattermostResponse(text: string) {
  return Response.json({ response_type: 'ephemeral', text })
}

function mattermostPublicResponse(text: string) {
  return Response.json({ response_type: 'in_channel', text })
}

async function authenticate(req: NextRequest): Promise<OrganizationExecutor> {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || !token.startsWith('kga_')) {
    throw new HttpError(401, 'Invalid token')
  }
  const { executor } = await resolveUserToken({ db }, token)
  return executor
}

async function findProject(executor: OrganizationExecutor, projectName: string) {
  try {
    return await getOrganizationProjectByName({ db }, executor, projectName)
  } catch (err) {
    if (err instanceof NotFoundError) return null
    throw err
  }
}

async function listAssignedProjects(executor: OrganizationExecutor) {
  const { items } = await listOrganizationProjectStatements({ db }, executor, { filter: 'joined' })
  return items.map((project) => ({ id: project.id, name: project.name }))
}

async function getOngoingActivities(executor: OrganizationExecutor) {
  const { items } = await listOrganizationProjectMemberActivities({ db }, executor, {
    ongoing: true,
    userId: executor.user.id,
  })
  return items
}

function formatDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}時間${minutes}分`
  return `${minutes}分`
}

async function getExecutorUserName(executor: OrganizationExecutor): Promise<string> {
  try {
    const user = await getUser({ db }, executor, { id: executor.user.id })
    return user.name ?? 'ユーザー'
  } catch {
    return 'ユーザー'
  }
}

async function handleStart(executor: OrganizationExecutor, args: string) {
  const parts = args.trim().split(/\s+/)
  const projectName = parts[0]
  if (!projectName) {
    const assignedProjects = await listAssignedProjects(executor)
    if (assignedProjects.length === 0) {
      return mattermostResponse('アサインされているプロジェクトがありません。')
    }
    const list = assignedProjects.map((p) => `- \`${p.name}\``).join('\n')
    return mattermostResponse(`プロジェクト名を指定してください。\n\n**利用可能なプロジェクト:**\n${list}\n\n使い方: \`start <プロジェクト名>\``)
  }

  const project = await findProject(executor, projectName)
  if (!project) {
    return mattermostResponse(`プロジェクト「${projectName}」が見つかりません。`)
  }

  // Check for ongoing activities
  const ongoing = await getOngoingActivities(executor)
  if (ongoing.length > 0) {
    const names = ongoing.map((a) => `\`${a.projectName}\``).join(', ')
    return mattermostResponse(`既に稼働中のアクティビティがあります: ${names}\n先に \`stop\` で終了してください。`)
  }

  const note = parts.slice(1).join(' ') || null

  await createOrganizationProjectMemberActivity({ db }, executor, {
    projectId: project.id,
    note,
  })

  const userName = await getExecutorUserName(executor)
  const noteText = note ? `\nメモ: ${note}` : ''
  return mattermostPublicResponse(`**${userName}** が **${project.name}** の稼働を開始しました :clock1:${noteText}`)
}

async function handleStop(executor: OrganizationExecutor, args: string) {
  const ongoing = await getOngoingActivities(executor)
  if (ongoing.length === 0) {
    return mattermostResponse('現在稼働中のアクティビティはありません。')
  }

  const now = new Date()
  const note = args.trim() || undefined
  const results: string[] = []

  for (const activity of ongoing) {
    const updates: { id: string; endedAt: string; note?: string } = {
      id: activity.id,
      endedAt: now.toISOString(),
    }
    if (note) updates.note = activity.note ? `${activity.note} / ${note}` : note

    await updateOrganizationProjectMemberActivity({ db }, executor, updates)

    const duration = formatDuration(activity.startedAt, now)
    results.push(`**${activity.projectName}** (${duration})`)
  }

  const userName = await getExecutorUserName(executor)
  return mattermostPublicResponse(`**${userName}** が稼働を終了しました :checkered_flag:\n${results.join('\n')}`)
}

async function handleStatus(executor: OrganizationExecutor) {
  const ongoing = await getOngoingActivities(executor)
  if (ongoing.length === 0) {
    return mattermostResponse('現在稼働中のアクティビティはありません。')
  }

  const now = new Date()
  const lines = ongoing.map((a) => {
    const duration = formatDuration(a.startedAt, now)
    const noteText = a.note ? ` - ${a.note}` : ''
    return `- **${a.projectName}** (${duration}経過)${noteText}`
  })

  return mattermostResponse(`**稼働中:**\n${lines.join('\n')}`)
}

async function handleProjects(executor: OrganizationExecutor) {
  const assignedProjects = await listAssignedProjects(executor)
  if (assignedProjects.length === 0) {
    return mattermostResponse('アサインされているプロジェクトがありません。')
  }
  const list = assignedProjects.map((p) => `- \`${p.name}\``).join('\n')
  return mattermostResponse(`**利用可能なプロジェクト:**\n${list}`)
}

function handleHelp() {
  return mattermostResponse(
    `**使い方:**
- \`start <プロジェクト名> [メモ]\` - 稼働を開始
- \`stop [メモ]\` - 稼働を終了
- \`status\` - 現在の稼働状況を確認
- \`projects\` - 利用可能なプロジェクト一覧
- \`help\` - このヘルプを表示`
  )
}

export async function POST(req: NextRequest) {
  try {
    const executor = await authenticate(req)

    const contentType = req.headers.get('content-type') ?? ''
    let text: string

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData()
      text = (formData.get('text') as string) ?? ''
    } else {
      const body = await req.json()
      text = body.text ?? ''
    }

    const trimmed = text.trim()
    const spaceIndex = trimmed.indexOf(' ')
    const command = spaceIndex === -1 ? trimmed.toLowerCase() : trimmed.slice(0, spaceIndex).toLowerCase()
    const args = spaceIndex === -1 ? '' : trimmed.slice(spaceIndex + 1)

    switch (command) {
      case 'start':
        return await handleStart(executor, args)
      case 'stop':
        return await handleStop(executor, args)
      case 'status':
        return await handleStatus(executor)
      case 'projects':
        return await handleProjects(executor)
      case 'help':
      case '':
        return handleHelp()
      default:
        return mattermostResponse(`不明なコマンド: \`${command}\`\n\`help\` で使い方を確認できます。`)
    }
  } catch (err) {
    if (err instanceof HttpError) {
      return mattermostResponse(`エラー: ${err.message}`)
    }
    console.error('Mattermost integration error:', err)
    return mattermostResponse('内部エラーが発生しました。')
  }
}
