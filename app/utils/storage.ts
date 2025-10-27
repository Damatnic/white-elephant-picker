export interface ExchangeHistory {
  id: string
  name: string
  date: string
  people: any[]
  results: any[]
  completed: boolean
}

export interface AppSettings {
  messageTemplate: string
  hapticFeedback: boolean
  soundEffects: boolean
  theme: string
}

export function saveExchangeHistory(exchange: ExchangeHistory) {
  const history = getExchangeHistory()
  history.push(exchange)
  localStorage.setItem('whiteElephantHistory', JSON.stringify(history))
}

export function getExchangeHistory(): ExchangeHistory[] {
  try {
    const saved = localStorage.getItem('whiteElephantHistory')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
  return []
}

export function deleteExchangeHistory(id: string) {
  const history = getExchangeHistory()
  const filtered = history.filter(ex => ex.id !== id)
  localStorage.setItem('whiteElephantHistory', JSON.stringify(filtered))
}

export function getSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('whiteElephantSettings')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
  
  return {
    messageTemplate: 'fun',
    hapticFeedback: true,
    soundEffects: false,
    theme: 'default'
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem('whiteElephantSettings', JSON.stringify(settings))
}

