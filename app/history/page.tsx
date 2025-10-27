'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getExchangeHistory, deleteExchangeHistory, ExchangeHistory } from '../utils/storage'
import { exportToJSON, exportToText, downloadFile } from '../utils/export'

export default function History() {
  const [history, setHistory] = useState<ExchangeHistory[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeHistory | null>(null)

  useEffect(() => {
    setHistory(getExchangeHistory())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this exchange?')) {
      deleteExchangeHistory(id)
      setHistory(getExchangeHistory())
    }
  }

  const handleExportJSON = (exchange: ExchangeHistory) => {
    const json = exportToJSON(exchange.results, exchange.name)
    downloadFile(json, `${exchange.name}-results.json`, 'application/json')
  }

  const handleExportText = (exchange: ExchangeHistory) => {
    const text = exportToText(exchange.results, exchange.name)
    downloadFile(text, `${exchange.name}-results.txt`, 'text/plain')
  }

  if (selectedExchange) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ease-out ${
        darkMode
          ? 'bg-gray-950 text-gray-100'
          : 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 text-white'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">
          <button
            onClick={() => setSelectedExchange(null)}
            className="mb-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all text-white font-semibold"
          >
            ← Back to History
          </button>

          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedExchange.name}</h2>
            <p className="text-white/80 text-sm mb-6">
              {new Date(selectedExchange.date).toLocaleDateString()} at {new Date(selectedExchange.date).toLocaleTimeString()}
              {selectedExchange.completed && <span className="ml-2 px-2 py-1 bg-green-500/20 rounded-full text-green-300 text-xs">Completed</span>}
            </p>

            <div className="space-y-3 mb-6">
              <h3 className="text-white font-bold text-lg">Results:</h3>
              {selectedExchange.results.map((result, index) => (
                <div key={index} className="p-3 bg-white/10 rounded-lg">
                  <span className="text-white font-semibold">{result.picker}</span>
                  <span className="text-white/60 mx-2">→</span>
                  <span className="text-yellow-300 font-semibold">{result.picked}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleExportJSON(selectedExchange)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
              >
                📄 Export JSON
              </button>
              <button
                onClick={() => handleExportText(selectedExchange)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all"
              >
                📝 Export Text
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            📚 Exchange History
          </h1>
        </div>

        {history.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
            <p className="text-white/80 text-lg mb-4">No exchanges saved yet</p>
            <p className="text-white/60 text-sm">Start an exchange and save results to view them here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map(exchange => (
              <div key={exchange.id} className="p-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{exchange.name}</h3>
                    <p className="text-white/70 text-sm">
                      {new Date(exchange.date).toLocaleDateString()} • {exchange.results.length} assignments
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(exchange.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedExchange(exchange)}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all flex-1"
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

