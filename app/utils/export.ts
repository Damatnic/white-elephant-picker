export interface ResultPair {
  picker: string
  picked: string
}

export function exportToJSON(results: ResultPair[], eventName: string): string {
  const data = {
    event: eventName,
    date: new Date().toISOString(),
    results: results
  }
  return JSON.stringify(data, null, 2)
}

export function exportToText(results: ResultPair[], eventName: string): string {
  let text = `${eventName}\n`
  text += `Generated: ${new Date().toLocaleDateString()}\n\n`
  text += 'Assignments:\n'
  text += '='.repeat(30) + '\n\n'
  
  results.forEach((pair, index) => {
    text += `${index + 1}. ${pair.picker} → ${pair.picked}\n`
  })
  
  return text
}

export function exportToSimple(results: ResultPair[]): string {
  return results.map(pair => `${pair.picker} got ${pair.picked}`).join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
    return false
  } catch (e) {
    console.error('Failed to copy:', e)
    return false
  }
}

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

