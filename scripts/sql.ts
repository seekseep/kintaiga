import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, basename, join } from 'node:path'
import postgres from 'postgres'

async function main() {
  const fileArg = process.argv[2]
  if (!fileArg) {
    console.error('Usage: pnpm sql <path-to-sql-file>')
    process.exit(1)
  }

  const sqlPath = resolve(fileArg)
  const sqlText = readFileSync(sqlPath, 'utf8').trim()
  if (!sqlText) {
    console.error('SQL file is empty')
    process.exit(1)
  }

  const baseName = basename(sqlPath).replace(/\.sql$/, '')
  const outPath = join(dirname(sqlPath), `${baseName}.result.txt`)

  const client = postgres(process.env.DATABASE_URL!, { prepare: false })

  try {
    const result = await client.unsafe(sqlText)
    writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n')
    console.log(`Wrote ${result.length} row(s) to ${outPath}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    writeFileSync(outPath, `ERROR: ${message}\n`)
    console.error(`SQL error written to ${outPath}`)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
