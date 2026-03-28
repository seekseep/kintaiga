import 'dotenv/config'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createMcpServer } from './server'
import { resolveToken } from '@/services/tokens'
import { db } from '@/lib/api-server/db'

async function main() {
  const token = process.env.MCP_TOKEN
  if (!token) {
    console.error('MCP_TOKEN environment variable is required')
    process.exit(1)
  }

  if (!token.startsWith('kga_')) {
    console.error('MCP_TOKEN must start with kga_')
    process.exit(1)
  }

  // Resolve token to get executor
  const { executor } = await resolveToken({ db }, token)

  console.error(`Authenticated as user ${executor.user.id} in organization ${executor.organization.id} (role: ${executor.organization.role})`)

  const server = createMcpServer(executor)
  const transport = new StdioServerTransport()

  await server.connect(transport)
  console.error('Kintaiga MCP server started (stdio)')
}

main().catch((err) => {
  console.error('Failed to start MCP server:', err)
  process.exit(1)
})
