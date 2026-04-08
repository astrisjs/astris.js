import { join } from 'node:path'

export async function serveStatic(pathname: string, publicDir: string): Promise<Response | null> {
  const filePath = join(publicDir, pathname)
  const file = Bun.file(filePath)

  if (!(await file.exists())) return null

  return new Response(file)
}
