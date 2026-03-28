type ParameterDefinition =
  | { key: string; type: 'string'; defaultValue?: string }
  | { key: string; type: 'number'; defaultValue?: number }
  | { key: string; type: 'boolean'; defaultValue?: boolean }

type InferParameterType<T extends ParameterDefinition> =
  T extends { type: 'string'; defaultValue: string } ? string :
  T extends { type: 'string' } ? string | undefined :
  T extends { type: 'number'; defaultValue: number } ? number :
  T extends { type: 'number' } ? number | undefined :
  T extends { type: 'boolean'; defaultValue: boolean } ? boolean :
  T extends { type: 'boolean' } ? boolean : never

type InferParameters<T extends readonly ParameterDefinition[]> = {
  [D in T[number] as D['key']]: InferParameterType<D>
}

export function getSearchParameters<const T extends readonly ParameterDefinition[]>(
  req: Request,
  defs: T,
): InferParameters<T> {
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

  return result as InferParameters<T>
}
