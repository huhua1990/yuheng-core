import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'

export interface InventoryRow {
  source: string
  owner: 'core' | 'demo' | 'excluded-sample'
  destination: string | null
}

export const businessAsset = /^assets\/(?:ai\/|audio\/|map\/|imgs\/(?:diy\/|iot\/|profile\.jpg$|wechat\.png$)|svgs\/(?:bpm\/|iot\/|pay\/|member_[^/]+\.svg$|send\.svg$))/
export const businessDomain = '(?:ai|ai1|bpm|crm|erp|fms|hrm|im|iot|mall|member|mes|mp|oa|pay|pms|report|wms)'

export function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = join(directory, entry.name)
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : []
  })
}

export function inventory(packageRoot: string): InventoryRow[] {
  return readFileSync(join(packageRoot, 'docs/admin-ui-migration-inventory.ndjson'), 'utf8')
    .trim().split(/?
/).map((line) => JSON.parse(line) as InventoryRow)
}

// Parse real module declarations: prose, comments and import-looking strings are not dependencies.
export function moduleSpecifiers(file: string, includeTypes = false): string[] {
  if (!/\.(?:[cm]?[jt]sx?|vue)$/.test(file) || (!includeTypes && file.endsWith('.d.ts'))) return []
  const text = readFileSync(file, 'utf8')
  const scripts = file.endsWith('.vue')
    ? [...text.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1])
    : [text]
  const modules: string[] = []
  for (const script of scripts) {
    const source = ts.createSourceFile(file, script, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        if (includeTypes || !node.importClause?.isTypeOnly) modules.push(node.moduleSpecifier.text)
      } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        if (includeTypes || !node.isTypeOnly) modules.push(node.moduleSpecifier.text)
      } else if (ts.isCallExpression(node) && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) {
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
          modules.push(node.arguments[0].text)
        }
      } else if (includeTypes && ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) {
        modules.push(node.argument.literal.text)
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
  }
  return modules
}

export function packageName(specifier: string): string | undefined {
  if (/^(?:[./]|@\/|[a-z]+:|\*)/.test(specifier) || specifier === 'yuheng-ui' || specifier.startsWith('yuheng-ui/')) return
  return specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]
}
