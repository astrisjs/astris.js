export function parseTemplateToUrl(template: string): URL {
  if (template.startsWith('http://') || template.startsWith('https://')) {
    return new URL(template)
  }
  return new URL(`https://github.com/${template}`)
}
