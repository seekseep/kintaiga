import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { createMcpServer } from '@/mcp/server'
import { authenticateRequest } from '@/mcp/auth'
import { getRateLimiter } from '@/mcp/rate-limit'

async function handleMcpRequest(req: Request): Promise<Response> {
  // Authenticate via PAT
  let executor
  let tokenId: string
  try {
    const result = await authenticateRequest(req)
    executor = result.executor
    tokenId = result.tokenId
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit
  const rateLimiter = getRateLimiter()
  const rateResult = await rateLimiter.check(tokenId)
  if (!rateResult.allowed) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateResult.resetAt.getTime() - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateResult.resetAt.toISOString(),
        },
      },
    )
  }

  // Create server and transport per request (stateless for serverless)
  const server = createMcpServer(executor)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  })

  await server.connect(transport)

  try {
    return await transport.handleRequest(req)
  } finally {
    await transport.close()
    await server.close()
  }
}

export const GET = handleMcpRequest
export const POST = handleMcpRequest
export const DELETE = handleMcpRequest
