export interface MessageTemplate {
  id: string
  name: string
  template: string
}

export const messageTemplates: MessageTemplate[] = [
  {
    id: 'fun',
    name: 'Fun & Energetic 🎉',
    template: '🎁 White Elephant Magic!\nYou\'re giving a gift to {picked}!\nGet ready for some fun! 🎉\n\nEvent: {event}'
  },
  {
    id: 'formal',
    name: 'Formal 📝',
    template: 'White Elephant Gift Exchange Assignment\n\nHi {picker},\n\nYou have been assigned to give a gift to: {picked}.\n\nEvent: {event}\nDate: {date}'
  },
  {
    id: 'emoji',
    name: 'Emoji-Heavy ✨',
    template: '🎁 You got {picked}! 🎉\nTime for some gift magic! ✨🎄⛄\n\nEvent: {event}'
  },
  {
    id: 'simple',
    name: 'Simple & Clean',
    template: 'White Elephant Assignment\n\nYou: {picker}\nYour person: {picked}\n\nEvent: {event}'
  }
]

export function generateMessage(
  templateId: string,
  picker: string,
  picked: string,
  eventName: string,
  customDate?: string
): string {
  const template = messageTemplates.find(t => t.id === templateId) || messageTemplates[2]
  const date = customDate || new Date().toLocaleDateString()
  
  return template.template
    .replace(/{picker}/g, picker)
    .replace(/{picked}/g, picked)
    .replace(/{event}/g, eventName)
    .replace(/{date}/g, date)
}

export function getDefaultTemplate(): string {
  return 'fun' // Default to fun template
}

