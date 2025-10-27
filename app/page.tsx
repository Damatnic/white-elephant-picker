'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generateMessage } from './utils/messaging'
import { getSettings, saveExchangeHistory } from './utils/storage'
import { exportToJSON, exportToText, exportToSimple, copyToClipboard, downloadFile, ResultPair } from './utils/export'

interface Person {
  id: string
  name: string
  phone: string
  restrictions: string[]
  isChosen?: boolean
  emoji: string
}

interface PickerAvailability {
  options: Person[]
  fallbackUsed: boolean
  strictCount: number
  remainingCount: number
}

// Empty initial state - users configure their own participants
const initialPeople: Person[] = []

const loadInitialPeople = (): Person[] => {
  if (typeof window === 'undefined') return initialPeople
  try {
    const saved = localStorage.getItem('whiteElephantSetup')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.people && Array.isArray(parsed.people) && parsed.people.length > 0) {
        return parsed.people.map((p: any) => ({ ...p, isChosen: false }))
      }
    }
  } catch (e) {
    console.error('Failed to load saved setup:', e)
  }
  return initialPeople
}

export default function Home() {
  const [people, setPeople] = useState<Person[]>(loadInitialPeople())
  const [selectedPicker, setSelectedPicker] = useState<string>('')
  const [pickedPerson, setPickedPerson] = useState<Person | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [lastPickUsedFallback, setLastPickUsedFallback] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [results, setResults] = useState<ResultPair[]>([])
  const [eventName, setEventName] = useState<string>('Gift Exchange')
  const [showExport, setShowExport] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const getPickerAvailability = (pickerId: string): PickerAvailability => {
    const picker = people.find(p => p.id === pickerId)
    if (!picker) {
      return {
        options: [],
        fallbackUsed: false,
        strictCount: 0,
        remainingCount: 0
      }
    }

    const strictOptions = people.filter(person =>
      person.id !== pickerId &&
      !picker.restrictions.includes(person.id) &&
      !person.isChosen
    )

    const remainingCount = people.filter(person =>
      person.id !== pickerId &&
      !person.isChosen
    ).length

    if (strictOptions.length > 0) {
      return {
        options: strictOptions,
        fallbackUsed: false,
        strictCount: strictOptions.length,
        remainingCount
      }
    }

    const fallbackOptions = people.filter(person =>
      person.id !== pickerId &&
      !person.isChosen
    )

    return {
      options: fallbackOptions,
      fallbackUsed: fallbackOptions.length > 0,
      strictCount: 0,
      remainingCount
    }
  }

  const sendSMS = async (pickerPhone: string, pickerName: string, pickedName: string, customMessage?: string) => {
    try {
      setIsSendingSMS(true)
      const message = customMessage || `🎁 White Elephant Magic! ${pickerName}, you picked ${pickedName}! Get ready for gift exchange fun! 🎉`
      
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: pickerPhone,
          message: message
        })
      })
      
      if (!response.ok) {
        console.error('SMS failed:', await response.text())
      }
    } catch (error) {
      console.error('SMS error:', error)
    } finally {
      setIsSendingSMS(false)
    }
  }

  const pickRandomPerson = () => {
    if (!selectedPicker) return

    const { options: availablePeople, fallbackUsed } = getPickerAvailability(selectedPicker)
    if (availablePeople.length === 0) {
      setShowResult(false)
      setIsAnimating(false)
      setConfetti(false)
      return
    }

    setIsAnimating(true)
    setShowResult(false)
    setConfetti(false)
    setLastPickUsedFallback(false)

    const picker = people.find(p => p.id === selectedPicker)!

    // Dramatic countdown animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availablePeople.length)
      const picked = availablePeople[randomIndex]
      
      // Check if we had to use emergency fallback (picking restricted person)
      const hadRestrictions = fallbackUsed && picker.restrictions.includes(picked.id)
      
      // Mark person as chosen
      setPeople(prev => prev.map(person => 
        person.id === picked.id 
          ? { ...person, isChosen: true }
          : person
      ))
      
      setPickedPerson(picked)
      setLastPickUsedFallback(hadRestrictions)
      setIsAnimating(false)
      setShowResult(true)
      setConfetti(true)
      
      // Track result
      setResults(prev => [...prev, { picker: picker.name, picked: picked.name }])
      
      // Generate message using template
      const settings = getSettings()
      const message = generateMessage(
        settings.messageTemplate,
        picker.name,
        picked.name,
        eventName
      )
      
      sendSMS(picker.phone, picker.name, picked.name, message)
    }, 3000)
  }

  const reset = () => {
    setSelectedPicker('')
    setPickedPerson(null)
    setShowResult(false)
    setIsAnimating(false)
    setConfetti(false)
    setLastPickUsedFallback(false)
  }
  
  const resetAll = () => {
    setPeople(initialPeople)
    reset()
    setResults([])
  }

  const handleExportJSON = () => {
    const json = exportToJSON(results, eventName)
    downloadFile(json, `${eventName}-results.json`, 'application/json')
  }

  const handleExportText = () => {
    const text = exportToText(results, eventName)
    downloadFile(text, `${eventName}-results.txt`, 'text/plain')
  }

  const handleCopyResults = async () => {
    const text = exportToSimple(results)
    const copied = await copyToClipboard(text)
    if (copied) {
      setNotification({ message: '✓ Results copied to clipboard!', type: 'success' })
      setTimeout(() => setNotification(null), 3000)
    } else {
      setNotification({ message: 'Failed to copy. Please try export instead.', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleSaveToHistory = () => {
    if (results.length === 0) {
      setNotification({ message: 'No results to save yet!', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
      return
    }
    
    saveExchangeHistory({
      id: `exchange-${Date.now()}`,
      name: eventName,
      date: new Date().toISOString(),
      people: people,
      results: results,
      completed: chosenCount === people.length
    })
    setNotification({ message: '✓ Exchange saved to history!', type: 'success' })
    setTimeout(() => setNotification(null), 3000)
  }

  const pickerName = people.find(p => p.id === selectedPicker)?.name || ''
  const availability = selectedPicker ? getPickerAvailability(selectedPicker) : null
  const availableOptions = availability?.options ?? []
  const availableCount = availableOptions.length
  const strictCount = availability?.strictCount ?? 0
  const fallbackActive = availability?.fallbackUsed ?? false
  const remainingCount = availability?.remainingCount ?? people.filter(person => !person.isChosen).length
  const chosenCount = people.filter(p => p.isChosen).length
  const confettiPieces = isMobile ? 22 : 48

  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => setConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confetti])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 640px)')

    const updateMatch = () => {
      setIsMobile(mediaQuery.matches)
    }

    updateMatch()

    mediaQuery.addEventListener('change', updateMatch)

    return () => mediaQuery.removeEventListener('change', updateMatch)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('whiteElephantSetup')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.eventName) {
          setEventName(parsed.eventName)
        }
      }
    } catch (e) {
      console.error('Failed to load event name:', e)
    }
  }, [])

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ease-out ${
        darkMode
          ? 'bg-gray-950 text-gray-100'
          : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white'
      }`}
    >
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(confettiPieces)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                top: `${Math.random() * 100}%`,
                fontSize: isMobile ? '1.5rem' : '2rem'
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl animate-slide-up ${
          notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white font-semibold max-w-md`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="relative">
        <div className="absolute top-4 right-4 flex gap-2 flex-wrap justify-end max-w-[60%] sm:max-w-none">
          <Link
            href="/setup"
            className="px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-white font-semibold text-sm"
          >
            ⚙️ Setup
          </Link>
          <Link
            href="/settings"
            className="px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-white font-semibold text-sm"
          >
            🎛️ Settings
          </Link>
          <Link
            href="/history"
            className="px-3 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-white font-semibold text-sm"
          >
            📚 History
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        
        <div className="text-center pt-10 pb-6 px-4 md:px-0">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 ${
              darkMode ? 'text-white' : 'text-white'
            } drop-shadow-lg`}
          >
            🎁 White Elephant Magic ✨
          </h1>
          <p
            className={`text-base sm:text-lg md:text-xl ${
              darkMode ? 'text-gray-300' : 'text-white/90'
            } font-medium max-w-2xl mx-auto leading-relaxed`}
          >
            The most fun way to pick your gift exchange partner!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 sm:pb-16 md:pb-20">
        {/* Game Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div
            className={`text-center p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/20'} backdrop-blur-sm shadow-lg shadow-black/10`}
          >
            <div className="text-2xl sm:text-3xl font-bold text-white">{chosenCount}</div>
            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Picked</div>
          </div>
          <div
            className={`text-center p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/20'} backdrop-blur-sm shadow-lg shadow-black/10`}
          >
            <div className="text-2xl sm:text-3xl font-bold text-white">{availableCount}</div>
            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Can Pick Now</div>
          </div>
          <div
            className={`text-center p-4 sm:p-5 rounded-2xl ${darkMode ? 'bg-gray-800/60' : 'bg-white/20'} backdrop-blur-sm shadow-lg shadow-black/10`}
          >
            <div className="text-2xl sm:text-3xl font-bold text-white">{remainingCount}</div>
            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Remaining</div>
          </div>
        </div>

        {/* Welcome Screen - No Participants */}
        {!showResult && !isAnimating && people.length === 0 && (
          <div
            className={`p-8 sm:p-12 rounded-3xl ${
              darkMode ? 'bg-gray-900/50' : 'bg-white/10'
            } backdrop-blur-lg border border-white/20 mb-8 shadow-xl shadow-black/10 text-center`}
          >
            <div className="text-7xl mb-6">🎁</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Welcome to White Elephant Picker!
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Get started by setting up your gift exchange. Add participants, set rules, and start picking!
            </p>
            <Link
              href="/setup"
              className="inline-block bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-12 rounded-2xl text-xl transform transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              🎯 Create Your Exchange
            </Link>
          </div>
        )}

        {/* Main Game Area */}
        {!showResult && !isAnimating && people.length > 0 && (
          <div
            className={`p-6 sm:p-8 rounded-3xl ${
              darkMode ? 'bg-gray-900/50' : 'bg-white/10'
            } backdrop-blur-lg border border-white/20 mb-8 shadow-xl shadow-black/10`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
              Who&apos;s picking today? 🤔
            </h2>
            
            {people.filter(p => p.isChosen).length === 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-300/40">
                <div className="text-center">
                  <p className="text-white text-base sm:text-lg mb-2">
                    🎯 <strong>Ready to start!</strong>
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">
                    Choose who is picking first, then pass the phone to the next person after they see their result.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
              {people.map((person) => (
                <button
                  key={person.id}
                    onClick={() => setSelectedPicker(person.id)}
                  className={`group p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 ${
                    selectedPicker === person.id
                      ? 'border-yellow-400 bg-yellow-400/20 scale-[1.02] shadow-2xl'
                      : `border-white/30 ${darkMode ? 'bg-gray-700/30' : 'bg-white/10'} hover:border-white/50`
                  }`}
                  aria-pressed={selectedPicker === person.id}
                  aria-label={`Select ${person.name} as the picker`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <span className="text-3xl sm:text-4xl">{person.emoji}</span>
                      <div className="text-left">
                        <div className="text-lg sm:text-xl font-bold text-white">
                          {person.name}
                        </div>
                        {person.restrictions.length > 0 && (
                          <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-white/70'}`}>
                            Can&apos;t pick: {person.restrictions.map(id =>
                              people.find(p => p.id === id)?.name
                            ).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPicker && availableCount > 0 && (
              <div className="space-y-4 text-center">
                <div
                  className={`p-4 rounded-2xl border ${
                    fallbackActive
                      ? 'bg-orange-500/15 border-orange-400/40'
                      : darkMode
                      ? 'bg-blue-900/30 border-blue-400/30'
                      : 'bg-blue-500/20 border-blue-400/30'
                  }`}
                >
                  <p className="text-white text-base sm:text-lg leading-snug">
                    <span className="font-bold">{pickerName}</span>{' '}
                    {strictCount > 0 ? (
                      <>
                        can pick from <span className="font-bold text-yellow-300">{strictCount}</span>{' '}
                        {strictCount === 1 ? 'person' : 'people'} right now.
                      </>
                    ) : (
                      <>
                        is out of normal options, so we&apos;ll allow a restricted pick to keep the game going.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={pickRandomPerson}
                    disabled={availableCount === 0}
                    className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-10 sm:px-12 rounded-2xl text-lg sm:text-xl transform transition-all duration-300 shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed ${
                      availableCount > 0 ? 'hover:scale-110 hover:from-yellow-500 hover:to-orange-600' : ''
                    }`}
                  >
                    🎲 Pick My Person!
                  </button>

                  <button
                    onClick={reset}
                    className="bg-white/10 text-white font-semibold py-3 px-8 rounded-2xl border border-white/30 hover:bg-white/20 transition-all"
                  >
                    🔄 Clear Selection
                  </button>
                </div>
              </div>
            )}

            {selectedPicker && availableCount === 0 && (
              <div className="text-center">
                <div className="p-6 rounded-2xl bg-red-500/20 border border-red-400/30">
                  <p className="text-white text-lg mb-4">
                    😱 <span className="font-bold">{pickerName}</span> has no one left to pick!
                  </p>
                  <p className="text-white text-sm mb-4">
                    Everyone available has already been chosen. Time to reset!
                  </p>
                  <button
                    onClick={resetAll}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl"
                  >
                    🔄 Reset Game
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Animation State */}
        {isAnimating && (
          <div
            className={`p-10 sm:p-12 rounded-3xl ${darkMode ? 'bg-gray-900/40' : 'bg-white/10'} backdrop-blur-lg text-center mb-8 shadow-2xl shadow-black/20`}
          >
            <div className="text-6xl sm:text-7xl md:text-8xl mb-6 animate-spin">🎁</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Picking someone for {pickerName}...
            </h2>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Result State */}
        {showResult && pickedPerson && (
          <div
            className={`p-10 sm:p-12 rounded-3xl ${darkMode ? 'bg-gray-900/40' : 'bg-white/10'} backdrop-blur-lg text-center mb-8 shadow-2xl shadow-black/20`}
          >
            <div className="text-6xl sm:text-7xl md:text-8xl mb-6">🎉</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {pickerName} picked...
            </h2>
            
            <div className="my-6 sm:my-8 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-4 border-yellow-400">
              <div className="text-5xl sm:text-6xl mb-4">{pickedPerson.emoji}</div>
              <div className="text-5xl sm:text-6xl font-black text-gray-900">
                {pickedPerson.name}!
              </div>
              {lastPickUsedFallback && (
                <p className="mt-3 text-sm sm:text-base text-gray-700 font-medium">
                  Restrictions were lifted to keep the fun going! 🎁
                </p>
              )}
            </div>
            
            <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8">
              Time for gift exchange magic! ✨🎁✨
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <button
                onClick={reset}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-7 sm:px-8 rounded-xl transform transition-all hover:scale-105"
              >
                🎲 Pick Again
              </button>
              <button
                onClick={resetAll}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-7 sm:px-8 rounded-xl transform transition-all hover:scale-105"
              >
                🔄 Reset All
              </button>
            </div>

            {/* Export Options */}
            {results.length > 0 && (
              <div className="mt-6 p-4 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
                <p className="text-white font-semibold mb-3 text-center">Export Results</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-all"
                  >
                    📄 JSON
                  </button>
                  <button
                    onClick={handleExportText}
                    className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-all"
                  >
                    📝 Text
                  </button>
                  <button
                    onClick={handleCopyResults}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg text-sm transition-all"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={handleSaveToHistory}
                    className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg text-sm transition-all"
                  >
                    💾 Save
                  </button>
                </div>
              </div>
            )}
            
            {isSendingSMS && (
              <div className="mt-4 p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
                <p className="text-white">📱 Sending magical SMS notification...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}