'use client'

import { useState, useEffect } from 'react'

interface Person {
  id: string
  name: string
  phone: string
  restrictions: string[]
  isChosen?: boolean
  emoji: string
}

const initialPeople: Person[] = [
  { id: 'nicholas', name: 'Nicholas', phone: '262-229-7103', restrictions: ['ellie'], isChosen: false, emoji: '🎮' },
  { id: 'ellie', name: 'Ellie', phone: '218-443-2237', restrictions: ['nicholas'], isChosen: false, emoji: '⚽' },
  { id: 'michael', name: 'Michael', phone: '414-343-9808', restrictions: ['alyssa'], isChosen: false, emoji: '🏀' },
  { id: 'alyssa', name: 'Alyssa', phone: '414-379-3165', restrictions: ['michael'], isChosen: false, emoji: '📚' },
  { id: 'mom', name: 'Mom', phone: '414-841-8664', restrictions: [], isChosen: false, emoji: '👑' }
]

export default function Home() {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [selectedPicker, setSelectedPicker] = useState<string>('')
  const [pickedPerson, setPickedPerson] = useState<Person | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const getAvailablePeople = (pickerId: string): Person[] => {
    const picker = people.find(p => p.id === pickerId)
    if (!picker) return []
    
    return people.filter(person => 
      person.id !== pickerId && 
      !picker.restrictions.includes(person.id) &&
      !person.isChosen
    )
  }

  const sendSMS = async (pickerPhone: string, pickerName: string, pickedName: string) => {
    try {
      setIsSendingSMS(true)
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: pickerPhone,
          message: `🎁 White Elephant Magic! ${pickerName}, you picked ${pickedName}! Get ready for gift exchange fun! 🎉`
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

    setIsAnimating(true)
    setShowResult(false)
    setConfetti(false)
    
    const availablePeople = getAvailablePeople(selectedPicker)
    const picker = people.find(p => p.id === selectedPicker)!
    
    // Dramatic countdown animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availablePeople.length)
      const picked = availablePeople[randomIndex]
      
      // Mark person as chosen
      setPeople(prev => prev.map(person => 
        person.id === picked.id 
          ? { ...person, isChosen: true }
          : person
      ))
      
      setPickedPerson(picked)
      setIsAnimating(false)
      setShowResult(true)
      setConfetti(true)
      
      // Send SMS notification
      sendSMS(picker.phone, picker.name, picked.name)
    }, 3000)
  }

  const reset = () => {
    setSelectedPicker('')
    setPickedPerson(null)
    setShowResult(false)
    setIsAnimating(false)
    setConfetti(false)
  }
  
  const resetAll = () => {
    setPeople(initialPeople)
    reset()
  }

  const pickerName = people.find(p => p.id === selectedPicker)?.name || ''
  const availableCount = selectedPicker ? getAvailablePeople(selectedPicker).length : 0

  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => setConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confetti])

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'}`}>
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: '2rem'
              }}
            >
              🎉
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="text-center pt-12 pb-8">
          <h1 className={`text-6xl font-black mb-4 ${darkMode ? 'text-white' : 'text-white'} drop-shadow-lg`}>
            🎁 White Elephant Magic ✨
          </h1>
          <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-white/90'} font-medium`}>
            The most fun way to pick your gift exchange partner!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/20'} backdrop-blur-sm`}>
            <div className="text-3xl font-bold text-white">{people.filter(p => p.isChosen).length}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Picked</div>
          </div>
          <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/20'} backdrop-blur-sm`}>
            <div className="text-3xl font-bold text-white">{availableCount}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Available</div>
          </div>
          <div className={`text-center p-4 rounded-2xl ${darkMode ? 'bg-gray-800/50' : 'bg-white/20'} backdrop-blur-sm`}>
            <div className="text-3xl font-bold text-white">{people.length - people.filter(p => p.isChosen).length}</div>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-white/80'}`}>Remaining</div>
          </div>
        </div>

        {/* Main Game Area */}
        {!showResult && !isAnimating && (
          <div className={`p-8 rounded-3xl ${darkMode ? 'bg-gray-800/30' : 'bg-white/10'} backdrop-blur-lg border border-white/20 mb-8`}>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Who&apos;s picking today? 🤔
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {people.map((person) => (
                <button
                  key={person.id}
                  onClick={() => setSelectedPicker(person.id)}
                  className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedPicker === person.id
                      ? 'border-yellow-400 bg-yellow-400/20 scale-105'
                      : `border-white/30 ${darkMode ? 'bg-gray-700/30' : 'bg-white/10'} hover:border-white/50`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">{person.emoji}</span>
                      <div className="text-left">
                        <div className="text-xl font-bold text-white">{person.name}</div>
                        {person.restrictions.length > 0 && (
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-white/70'}`}>
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
              <div className="text-center">
                <div className={`mb-6 p-4 rounded-2xl ${darkMode ? 'bg-blue-900/30' : 'bg-blue-500/20'} border border-blue-400/30`}>
                  <p className="text-white text-lg">
                    <span className="font-bold">{pickerName}</span> can pick from{' '}
                    <span className="font-bold text-yellow-400">{availableCount}</span> people
                  </p>
                </div>
                
                <button
                  onClick={pickRandomPerson}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-12 rounded-2xl text-xl transform transition-all duration-300 hover:scale-110 shadow-2xl"
                >
                  🎲 Pick My Person!
                </button>
              </div>
            )}

            {selectedPicker && availableCount === 0 && (
              <div className="text-center">
                <div className="p-6 rounded-2xl bg-red-500/20 border border-red-400/30">
                  <p className="text-white text-lg mb-4">
                    😱 <span className="font-bold">{pickerName}</span> has no one left to pick!
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
          <div className={`p-12 rounded-3xl ${darkMode ? 'bg-gray-800/30' : 'bg-white/10'} backdrop-blur-lg text-center mb-8`}>
            <div className="text-8xl mb-6 animate-spin">🎁</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Picking someone for {pickerName}...
            </h2>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"
                  style={{animationDelay: `${i * 0.2}s`}}
                />
              ))}
            </div>
          </div>
        )}

        {/* Result State */}
        {showResult && pickedPerson && (
          <div className={`p-12 rounded-3xl ${darkMode ? 'bg-gray-800/30' : 'bg-white/10'} backdrop-blur-lg text-center mb-8`}>
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              {pickerName} picked...
            </h2>
            
            {/* THE FIXED RESULT DISPLAY */}
            <div className="my-8 p-8 bg-white rounded-3xl shadow-2xl border-4 border-yellow-400">
              <div className="text-6xl mb-4">{pickedPerson.emoji}</div>
              <div className="text-6xl font-black text-gray-900">
                {pickedPerson.name}!
              </div>
            </div>
            
            <p className="text-xl text-white mb-8">
              Time for gift exchange magic! ✨🎁✨
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={reset}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-8 rounded-xl transform transition-all hover:scale-105"
              >
                🎲 Pick Again
              </button>
              <button
                onClick={resetAll}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-xl transform transition-all hover:scale-105"
              >
                🔄 Reset All
              </button>
            </div>
            
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