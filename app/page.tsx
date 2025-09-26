'use client'

import { useState } from 'react'

interface Person {
  id: string
  name: string
  phone: string
  restrictions: string[]
  isChosen?: boolean
}

const initialPeople: Person[] = [
  { id: 'nicholas', name: 'Nicholas', phone: '262-229-7103', restrictions: ['ellie'], isChosen: false },
  { id: 'ellie', name: 'Ellie', phone: '218-443-2237', restrictions: ['nicholas'], isChosen: false },
  { id: 'michael', name: 'Michael', phone: '414-343-9808', restrictions: ['alyssa'], isChosen: false },
  { id: 'alyssa', name: 'Alyssa', phone: '414-379-3165', restrictions: ['michael'], isChosen: false },
  { id: 'mom', name: 'Mom', phone: '414-841-8664', restrictions: [], isChosen: false }
]

export default function Home() {
  const [people, setPeople] = useState<Person[]>(initialPeople)
  const [selectedPicker, setSelectedPicker] = useState<string>('')
  const [pickedPerson, setPickedPerson] = useState<string>('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [isSendingSMS, setIsSendingSMS] = useState(false)

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
          message: `🎁 White Elephant Result: ${pickerName}, you picked ${pickedName}! Time for gift exchange! 🎉`
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
    
    const availablePeople = getAvailablePeople(selectedPicker)
    
    // Add some suspense with a delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availablePeople.length)
      const picked = availablePeople[randomIndex]
      const picker = people.find(p => p.id === selectedPicker)!
      
      // Mark person as chosen
      setPeople(prev => prev.map(person => 
        person.id === picked.id 
          ? { ...person, isChosen: true }
          : person
      ))
      
      setPickedPerson(picked.name)
      setIsAnimating(false)
      setShowResult(true)
      
      // Send SMS notification
      sendSMS(picker.phone, picker.name, picked.name)
    }, 2000)
  }

  const reset = () => {
    setSelectedPicker('')
    setPickedPerson('')
    setShowResult(false)
    setIsAnimating(false)
  }
  
  const resetAll = () => {
    setPeople(initialPeople)
    reset()
  }

  const pickerName = people.find(p => p.id === selectedPicker)?.name || ''
  const availableCount = selectedPicker ? getAvailablePeople(selectedPicker).length : 0

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎁 White Elephant Name Picker
        </h1>
        <p className="text-gray-800 text-lg">
          Pick a name for your gift exchange with custom restrictions!
        </p>
      </div>

      {!showResult && !isAnimating && (
        <div className="card animate-fade-in">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Who&apos;s picking today?
          </h2>
          
          <div className="grid gap-3 mb-6">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setSelectedPicker(person.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 relative ${
                  selectedPicker === person.id
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium flex justify-between items-center">
                  {person.name}
                  {person.isChosen && <span className="text-green-600 text-sm">✓ Chosen</span>}
                </div>
                {person.restrictions.length > 0 && (
                  <div className="text-sm text-gray-700 mt-1">
                    Can&apos;t pick: {person.restrictions.map(id => 
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {pickerName} picked...
            </h2>
             <div className="text-5xl font-bold text-white bg-gradient-to-r from-red-500 to-red-600 mb-6 animate-slide-up p-6 rounded-xl border-4 border-black shadow-2xl">
               {pickedPerson}!
             </div>
            <p className="text-gray-800 text-lg mb-6">
              Time to exchange gifts! 🎁
            </p>
            <button
              onClick={reset}
              className="btn-secondary"
            >
              Pick Again
            </button>
            <button
              onClick={resetAll}
              className="btn-secondary ml-4"
            >
              Reset All
            </button>
            {isSendingSMS && (
              <p className="text-sm text-blue-600 mt-2">
                📱 Sending SMS notification...
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
          <ul className="text-sm text-gray-800 space-y-1 text-left">
            <li>• Nicholas and Ellie can&apos;t pick each other (they live together)</li>
            <li>• Michael and Alyssa can&apos;t pick each other (they live together)</li>
            <li>• Mom can pick anyone</li>
            <li>• People already chosen can&apos;t be picked again</li>
            <li>• SMS notifications sent automatically to the picker</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
