type ParamDef =
  | { key: string; type: 'string'; defaultValue?: string }
  | { key: string; type: 'number'; defaultValue?: number }
  | { key: string; type: 'boolean'; defaultValue?: boolean }

type InferParamType<T extends ParamDef> =
  T extends { type: 'string'; defaultValue: string } ? string :
  T extends { type: 'string' } ? string | undefined :
  T extends { type: 'number'; defaultValue: number } ? number :
  T extends { type: 'number' } ? number | undefined :
  T extends { type: 'boolean'; defaultValue: boolean } ? boolean :
  T extends { type: 'boolean' } ? boolean : never

type InferParams<T extends readonly ParamDef[]> = {
  [D in T[number] as D['key']]: InferParamType<D>
}

export function getSearchParams<const T extends readonly ParamDef[]>(
  req: Request,
  defs: T,
): InferParams<T> {
  const url = new URL(req.url)
  const result = {} as Record<string, unknown>

  for (const def of defs) {
    const raw = url.searchParams.get(def.key)

    switch (def.type) {
      case 'string':
        result[def.key] = raw ?? def.defaultValue ?? undefined
        break
      case 'number':
        result[def.key] = raw != null ? parseInt(raw, 10) : (def.defaultValue ?? undefined)
        break
      case 'boolean':
        result[def.key] = raw != null ? raw === 'true' : (def.defaultValue ?? false)
        break
    }
  }

  return result as InferParams<T>
}
