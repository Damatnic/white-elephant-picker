'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Person {
  id: string
  name: string
  phone: string
  restrictions: string[]
  emoji: string
}

type RuleTemplate = 'family' | 'office' | 'friends' | 'custom'

const emojiOptions = ['🎄', '🎁', '🎅', '❄️', '🌟', '☃️', '🎀', '🎂', '🎊', '🎉']

export default function Setup() {
  const router = useRouter()
  const [eventName, setEventName] = useState('Holiday Gift Exchange')
  const [ruleTemplate, setRuleTemplate] = useState<RuleTemplate>('custom')
  const [people, setPeople] = useState<Person[]>([])
  const [darkMode, setDarkMode] = useState(false)

  const addPerson = () => {
    const newId = `person-${Date.now()}`
    const newPerson: Person = {
      id: newId,
      name: '',
      phone: '',
      restrictions: [],
      emoji: emojiOptions[Math.floor(Math.random() * emojiOptions.length)]
    }
    setPeople([...people, newPerson])
  }

  const updatePerson = (id: string, field: keyof Person, value: string) => {
    setPeople(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const updatePersonRestrictions = (id: string, restrictedId: string, add: boolean) => {
    setPeople(prev => prev.map(p => {
      if (p.id === id) {
        if (add && !p.restrictions.includes(restrictedId)) {
          return { ...p, restrictions: [...p.restrictions, restrictedId] }
        } else if (!add) {
          return { ...p, restrictions: p.restrictions.filter(r => r !== restrictedId) }
        }
      }
      return p
    }))
  }

  const removePerson = (id: string) => {
    setPeople(prev => prev.filter(p => p.id !== id))
  }

  const toggleRestriction = (personId: string, restrictedId: string) => {
    const person = people.find(p => p.id === personId)
    if (person) {
      const isRestricted = person.restrictions.includes(restrictedId)
      updatePersonRestrictions(personId, restrictedId, !isRestricted)
    }
  }

  const applyTemplate = (template: RuleTemplate) => {
    if (template === 'family') {
      // Clear all restrictions - users can set their own for family
      setPeople(prev => prev.map(p => ({ ...p, restrictions: [] })))
    }
    // Office and Friends have no restrictions by default
    if (template === 'office' || template === 'friends') {
      setPeople(prev => prev.map(p => ({ ...p, restrictions: [] })))
    }
  }

  const startGame = () => {
    const validPeople = people.filter(p => p.name.trim() !== '')
    if (validPeople.length < 2) {
      alert('You need at least 2 participants to start!')
      return
    }

    // Store in localStorage for the game to use
    localStorage.setItem('whiteElephantSetup', JSON.stringify({
      eventName,
      people: validPeople.map(p => ({ ...p, isChosen: false }))
    }))

    router.push('/')
  }

  useEffect(() => {
    if (ruleTemplate !== 'custom') {
      applyTemplate(ruleTemplate)
    }
  }, [ruleTemplate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedSetup = localStorage.getItem('whiteElephantSetup')
    if (savedSetup) {
      try {
        const parsed = JSON.parse(savedSetup)
        if (parsed.people && parsed.people.length > 0) {
          setEventName(parsed.eventName || 'Holiday Gift Exchange')
          setPeople(parsed.people)
        }
      } catch (e) {
        console.error('Failed to load saved setup:', e)
      }
    }
  }, [])

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-out ${
      darkMode
        ? 'bg-gray-950 text-gray-100'
        : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
        {/* Header */}
        <div className="relative mb-8">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-0 right-0 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <h1 className="text-4xl sm:text-5xl font-black mb-4 drop-shadow-lg text-center">
            🎁 Setup Your Exchange
          </h1>
          <p className="text-center text-lg text-white/90">
            Configure your White Elephant gift exchange
          </p>
        </div>

        {/* Event Name */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <label className="block text-white font-bold mb-3">Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Holiday Gift Exchange 2024"
          />
        </div>

        {/* Rule Template Selection */}
        <div className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
          <label className="block text-white font-bold mb-3">Rule Template</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setRuleTemplate('family')}
              className={`p-4 rounded-xl border-2 transition-all ${
                ruleTemplate === 'family'
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <div className="text-white font-bold text-sm">Family</div>
            </button>
            <button
              onClick={() => setRuleTemplate('office')}
              className={`p-4 rounded-xl border-2 transition-all ${
                ruleTemplate === 'office'
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-3xl mb-2">💼</div>
              <div className="text-white font-bold text-sm">Office</div>
            </button>
            <button
              onClick={() => setRuleTemplate('friends')}
              className={`p-4 rounded-xl border-2 transition-all ${
                ruleTemplate === 'friends'
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="text-white font-bold text-sm">Friends</div>
            </button>
            <button
              onClick={() => setRuleTemplate('custom')}
              className={`p-4 rounded-xl border-2 transition-all ${
                ruleTemplate === 'custom'
                  ? 'bg-purple-500/30 border-purple-400'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-3xl mb-2">⚙️</div>
              <div className="text-white font-bold text-sm">Custom</div>
            </button>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Participants</h2>
            <button
              onClick={addPerson}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
            >
              + Add Person
            </button>
          </div>

          {people.length === 0 && (
            <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <p className="text-white/80 mb-4">No participants yet. Click &quot;Add Person&quot; to get started!</p>
            </div>
          )}

          {people.map((person, idx) => (
            <div key={person.id} className="mb-4 p-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mb-4">
                {/* Emoji */}
                <div className="sm:col-span-1 text-4xl text-center">{person.emoji}</div>
                
                {/* Name */}
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={person.name}
                    onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
                
                {/* Phone */}
                <div className="sm:col-span-4">
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={person.phone}
                    onChange={(e) => updatePerson(person.id, 'phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
                
                {/* Remove */}
                <div className="sm:col-span-3">
                  <button
                    onClick={() => removePerson(person.id)}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Restrictions */}
              {people.length > 1 && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/90 font-semibold mb-2">Can&apos;t choose:</p>
                  <div className="flex flex-wrap gap-2">
                    {people.filter(p => p.id !== person.id && p.name.trim()).map(other => (
                      <button
                        key={other.id}
                        onClick={() => toggleRestriction(person.id, other.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                          person.restrictions.includes(other.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {other.emoji} {other.name || 'No name'}
                      </button>
                    ))}
                  </div>
                  {people.filter(p => p.id !== person.id && p.name.trim()).length === 0 && (
                    <p className="text-white/60 text-sm">Add names to other participants first</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="sticky bottom-4 bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-2xl shadow-2xl">
          <button
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-xl rounded-2xl transition-all transform hover:scale-[1.02]"
          >
            🎲 Start Gift Exchange!
          </button>
        </div>
      </div>
    </div>
  )
}

