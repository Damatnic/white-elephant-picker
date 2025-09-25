'use client'

import { useState } from 'react'

interface Person {
  id: string
  name: string
  restrictions: string[]
}

const people: Person[] = [
  { id: 'nicholas', name: 'Nicholas', restrictions: ['ellie'] },
  { id: 'ellie', name: 'Ellie', restrictions: ['nicholas'] },
  { id: 'michael', name: 'Michael', restrictions: ['alyssa'] },
  { id: 'alyssa', name: 'Alyssa', restrictions: ['michael'] },
  { id: 'mom', name: 'Mom', restrictions: [] }
]

export default function Home() {
  const [selectedPicker, setSelectedPicker] = useState<string>('')
  const [pickedPerson, setPickedPerson] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const getAvailablePeople = (pickerId: string): Person[] => {
    const picker = people.find(p => p.id === pickerId)
    if (!picker) return []
    
    return people.filter(person => 
      person.id !== pickerId && 
      !picker.restrictions.includes(person.id)
    )
  }

  const pickRandomPerson = () => {
    if (!selectedPicker) return

    setIsAnimating(true)
    setShowResult(false)
    
    const availablePeople = getAvailablePeople(selectedPicker)
    
    // Add some suspense with a delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availablePeople.length)
      const picked = availablePeople[randomIndex]
      setPickedPerson(picked.name)
      setIsAnimating(false)
      setShowResult(true)
    }, 2000)
  }

  const reset = () => {
    setSelectedPicker('')
    setPickedPerson('')
    setShowResult(false)
    setIsAnimating(false)
  }

  const pickerName = people.find(p => p.id === selectedPicker)?.name || ''
  const availableCount = selectedPicker ? getAvailablePeople(selectedPicker).length : 0

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🎁 White Elephant Name Picker
        </h1>
        <p className="text-gray-600">
          Pick a name for your gift exchange with custom restrictions!
        </p>
      </div>

      {!showResult && !isAnimating && (
        <div className="card animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Who's picking today?
          </h2>
          
          <div className="grid gap-3 mb-6">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPicker(person.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedPicker === person.id
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium">{person.name}</div>
                {person.restrictions.length > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Can't pick: {person.restrictions.map(id => 
                      people.find(p => p.id === id)?.name
                    ).join(', ')}
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedPicker && (
            <div className="text-center animate-slide-up">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800">
                  <strong>{pickerName}</strong> can pick from <strong>{availableCount}</strong> people
                </p>
              </div>
              
              <button
                onClick={pickRandomPerson}
                className="btn-primary w-full text-lg"
              >
                🎲 Pick Random Person
              </button>
            </div>
          )}
        </div>
      )}

      {isAnimating && (
        <div className="card text-center animate-fade-in">
          <div className="py-12">
            <div className="text-6xl mb-4 animate-bounce">🎁</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Picking someone for {pickerName}...
            </h2>
            <div className="flex justify-center items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className="card text-center animate-fade-in">
          <div className="py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {pickerName} picked...
            </h2>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 animate-slide-up">
              {pickedPerson}!
            </div>
            <p className="text-gray-600 mb-6">
              Time to exchange gifts! 🎁
            </p>
            <button
              onClick={reset}
              className="btn-secondary"
            >
              Pick Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-3">How it works:</h3>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Nicholas and Ellie can't pick each other (they live together)</li>
            <li>• Michael and Alyssa can't pick each other (they live together)</li>
            <li>• Mom can pick anyone</li>
            <li>• Everyone else follows the same rules</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
