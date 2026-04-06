import { readFile } from 'node:fs/promises'
import type { ParsedRoute, TypeInfo } from '@astris/types'

async function parseTypeDefinitions(filePath: string): Promise<TypeInfo[]> {
  const content = await readFile(filePath, 'utf-8')
  const types: TypeInfo[] = []

  const typeRegex = /export\s+(interface|type)\s+(\w+)\s*[={]/g

  for (const match of content.matchAll(typeRegex)) {
    types.push({
      name: match[2],
      kind: match[1] as 'interface' | 'type',
      exported: true,
    })
  }

  return types
}

function extractExportedFunctions(content: string): string[] {
  const funcRegex = /export\s+(?:async\s)?function\s+(\w+)\s*\(/g
  const functions: string[] = []

  for (const match of content.matchAll(funcRegex)) {
    functions.push(match[1])
  }

  return functions
}

function findTypesForMethod(
  method: string,
  allTypes: TypeInfo[]
): { requestType?: TypeInfo; responseType?: TypeInfo } {
  const requestName = `${method}Request`
  const responseName = `${method}Response`

  const requestType = allTypes.find(t => t.name === requestName)
  const responseType = allTypes.find(t => t.name === responseName)

  return { requestType, responseType }
}

export async function parseRoute(filePath: string): Promise<ParsedRoute> {
  const content = await readFile(filePath, 'utf-8')

  const types = await parseTypeDefinitions(filePath)
  const functions = extractExportedFunctions(content)

  const result: ParsedRoute = {
    filePath,
    methods: {},
  }

  const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

  for (const method of httpMethods) {
    if (functions.includes(method)) {
      result.methods[method as keyof ParsedRoute['methods']] = findTypesForMethod(method, types)
    }
  }

  return result
}
