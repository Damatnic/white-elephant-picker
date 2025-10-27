'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSettings, saveSettings, AppSettings } from '../utils/storage'
import { messageTemplates } from '../utils/messaging'

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    messageTemplate: 'fun',
    hapticFeedback: true,
    soundEffects: false,
    theme: 'default'
  })
  const [darkMode, setDarkMode] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    setSaved(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSettings(getSettings())
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && settings.messageTemplate !== 'fun') {
      saveSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }, [settings])

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-out ${
      darkMode
        ? 'bg-gray-950 text-gray-100'
        : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Header */}
        <div className="relative mb-8">
          <Link
            href="/"
            className="absolute top-0 left-0 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-white font-semibold"
          >
            ← Back
          </Link>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-0 right-0 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-black mb-4 drop-shadow-lg text-center mt-12">
            ⚙️ Settings
          </h1>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-400/40 rounded-2xl text-center">
            <p className="text-white font-semibold">✓ Settings saved!</p>
          </div>
        )}

        {/* Message Template */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <label className="block text-white font-bold mb-4 text-lg">Message Template</label>
          <p className="text-white/80 text-sm mb-4">
            Choose how SMS notifications are formatted
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {messageTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => updateSetting('messageTemplate', template.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  settings.messageTemplate === template.id
                    ? 'bg-purple-500/30 border-purple-400'
                    : 'bg-white/10 border-white/30 hover:border-white/50'
                }`}
              >
                <div className="text-white font-bold">{template.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Haptic Feedback */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-white font-bold mb-2 text-lg">Haptic Feedback</label>
              <p className="text-white/80 text-sm">
                Vibrate device on important actions
              </p>
            </div>
            <button
              onClick={() => updateSetting('hapticFeedback', !settings.hapticFeedback)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                settings.hapticFeedback ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.hapticFeedback ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sound Effects */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-white font-bold mb-2 text-lg">Sound Effects</label>
              <p className="text-white/80 text-sm">
                Play sounds on pick completion
              </p>
            </div>
            <button
              onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
              className={`relative w-16 h-8 rounded-full transition-colors ${
                settings.soundEffects ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  settings.soundEffects ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <label className="block text-white font-bold mb-4 text-lg">Theme</label>
          <div className="grid grid-cols-3 gap-3">
            {['default', 'christmas', 'blue'].map(theme => (
              <button
                key={theme}
                onClick={() => updateSetting('theme', theme)}
                className={`p-4 rounded-xl border-2 transition-all capitalize ${
                  settings.theme === theme
                    ? 'bg-purple-500/30 border-purple-400'
                    : 'bg-white/10 border-white/30 hover:border-white/50'
                }`}
              >
                <div className="text-white font-bold">{theme}</div>
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <h2 className="text-white font-bold mb-4 text-lg">About</h2>
          <p className="text-white/80 text-sm mb-2">
            White Elephant Picker v1.0
          </p>
          <p className="text-white/60 text-xs">
            Made with ❤️ for family gift exchanges
          </p>
        </div>
      </div>
    </div>
  )
}

