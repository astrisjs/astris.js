export interface RouteEntry {
  path: string
  pageFile?: string
  apiFile?: string
  params: string[]
  isDynamic: boolean
  isCatchAll: boolean
}

export interface ScanResult {
  routes: RouteEntry[]
  errors: string[]
}

export interface TypeInfo {
  name: string
  kind: 'interface' | 'type'
  exported: boolean
  properties?: Record<string, string>
}

export interface ParsedRoute {
  filePath: string
  methods: {
    GET?: { requestType?: TypeInfo; responseType?: TypeInfo }
    POST?: { requestType?: TypeInfo; responseType?: TypeInfo }
    PUT?: { requestType?: TypeInfo; responseType?: TypeInfo }
    DELETE?: { requestType?: TypeInfo; responseType?: TypeInfo }
    PATCH?: { requestType?: TypeInfo; responseType?: TypeInfo }
  }
}

export interface CodegenResult {
  content: string
  warnings: string[]
}

export interface MatchedRoute {
  entry: RouteEntry
  params: Record<string, string | string[]>
  isApi: boolean
}
