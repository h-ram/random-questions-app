import { useState, useEffect } from 'react'
import './App.css'
import questionsData from './assets/questions.json'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Checkbox } from './components/ui/checkbox'
import { Users, Play, RotateCcw, Shuffle } from 'lucide-react'

function App() {
  const [gameState, setGameState] = useState({
    players: [],
    currentPlayerIndex: 0,
    usedQuestions: new Set(),
    selectedCategories: ['All'],
    gameStarted: false,
    currentQuestion: null
  })

  const [newPlayerName, setNewPlayerName] = useState('')
  const [availableCategories, setAvailableCategories] = useState([])

  // Player emojis for visual variety
  const playerEmojis = ['🎯', '🎮', '🎲', '🎪', '🎨', '🎭', '🎸', '🎤']

  // Category emojis for better visual appeal
  const categoryEmojis = {
    'All': '🌟',
    'General': '💭',
    'Sex & Intimacy (NSFW)': '🔥',
    'Dark Thoughts & Dirty Secrets': '🖤',
    'Moral Dilemmas': '⚖️',
    'Love & Betrayal': '💔',
    'Greed, Envy, and Status': '💰',
    'Friendship & Loyalty': '🤝',
    'Identity & Self-Deception': '🎭',
    'Love, Lust & Betrayal': '💋',
    'Morally Grey & Just Wrong': '⚡',
    'Relationships & Trust Issues': '🔗',
    'Mental Shadows & Identity': '🧠',
    'Sex & Raw Intimacy': '🌹',
    'Jealousy, Resentment & Silent Rage': '😤',
    'Love Games & Emotional Damage': '🎪',
    'Taboo Fantasies & Dangerous Games': '🎲',
    'Emotional Violence & Love Warfare': '⚔️',
    'Manipulation, Control & Psychological Games': '🎯',
    'Disturbing Desires & Twisted Fantasies': '🌙',
    'Guilt, Shame & Things That Shouldn\'t Be Said': '😶',
    'Vengeance, Petty Acts & Dark Gratification': '👑',
    'Sexual Shame, Risk & Chaos': '🌪️'
  }

  // Extract unique categories from questions
  useEffect(() => {
    const categories = [...new Set(questionsData.map(q => q.category))]
    setAvailableCategories(['All', ...categories])
  }, [])

  const addPlayer = () => {
    if (newPlayerName.trim() && gameState.players.length < 8) {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, newPlayerName.trim()]
      }))
      setNewPlayerName('')
    }
  }

  const removePlayer = (index) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index)
    }))
  }

  const toggleCategory = (category) => {
    setGameState(prev => {
      let newCategories
      if (category === 'All') {
        newCategories = prev.selectedCategories.includes('All') ? [] : ['All']
      } else {
        const withoutAll = prev.selectedCategories.filter(c => c !== 'All')
        if (withoutAll.includes(category)) {
          newCategories = withoutAll.filter(c => c !== category)
        } else {
          newCategories = [...withoutAll, category]
        }
      }
      return { ...prev, selectedCategories: newCategories }
    })
  }

  const getFilteredQuestions = () => {
    if (gameState.selectedCategories.includes('All') || gameState.selectedCategories.length === 0) {
      return questionsData
    }
    return questionsData.filter(q => gameState.selectedCategories.includes(q.category))
  }

  const getRandomQuestion = () => {
    const filteredQuestions = getFilteredQuestions()
    const availableQuestions = filteredQuestions.filter(q => 
      !gameState.usedQuestions.has(q.question)
    )
    
    if (availableQuestions.length === 0) {
      return null // No more questions available
    }
    
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    return availableQuestions[randomIndex]
  }

  const startGame = () => {
    if (gameState.players.length > 0 && gameState.selectedCategories.length > 0) {
      const firstQuestion = getRandomQuestion()
      setGameState(prev => ({
        ...prev,
        gameStarted: true,
        currentQuestion: firstQuestion,
        usedQuestions: firstQuestion ? new Set([firstQuestion.question]) : new Set()
      }))
    }
  }

  const nextQuestion = () => {
    const nextQuestion = getRandomQuestion()
    setGameState(prev => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      currentQuestion: nextQuestion,
      usedQuestions: nextQuestion ? new Set([...prev.usedQuestions, nextQuestion.question]) : prev.usedQuestions
    }))
  }

  const resetGame = () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      usedQuestions: new Set(),
      selectedCategories: ['All'],
      gameStarted: false,
      currentQuestion: null
    })
  }

  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex]
  }

  const getUsedQuestionsCount = () => {
    return gameState.usedQuestions.size
  }

  const getTotalAvailableQuestions = () => {
    return getFilteredQuestions().length
  }

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🎯 Interactive Quiz Game</h1>
            <p className="text-white/80">Set up players and categories to start the quiz!</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({gameState.players.length}/8)
              </CardTitle>
              <CardDescription>Add players to participate in the quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                  disabled={gameState.players.length >= 8}
                />
                <Button 
                  onClick={addPlayer} 
                  disabled={gameState.players.length >= 8}
                  className="cursor-pointer"
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {gameState.players.map((player, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground text-base py-2 px-3"
                    onClick={() => removePlayer(index)}
                  >
                    {playerEmojis[index]} {player} ×
                  </Badge>
                ))}
              </div>
              
              {/* Mobile-friendly Start Quiz button positioned before categories */}
              <div className="mt-6 md:hidden">
                <Button
                  onClick={startGame}
                  disabled={gameState.players.length === 0 || gameState.selectedCategories.length === 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz ({getTotalAvailableQuestions()} questions available)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🎲 Categories</CardTitle>
              <CardDescription>Select which categories to include in the quiz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={gameState.selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                      className="cursor-pointer"
                    />
                    <label 
                      htmlFor={category} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span>{categoryEmojis[category] || '❓'}</span>
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Desktop Start Quiz button */}
          <div className="hidden md:block">
            <Button
              onClick={startGame}
              disabled={gameState.players.length === 0 || gameState.selectedCategories.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Quiz ({getTotalAvailableQuestions()} questions available)
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">🎯 Quiz Game</h1>
          <Button 
            onClick={resetGame} 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Game
          </Button>
        </div>

        {/* Players Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>👥 Players</span>
              <Badge variant="secondary">
                Question {getUsedQuestionsCount()} of {getTotalAvailableQuestions()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {gameState.players.map((player, index) => (
                <Badge
                  key={index}
                  variant={index === gameState.currentPlayerIndex ? "default" : "secondary"}
                  className={index === gameState.currentPlayerIndex ? 
                    "bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse text-lg py-3 px-4 font-bold" : 
                    "text-base py-2 px-3"
                  }
                >
                  {playerEmojis[index]} {player}
                  {index === gameState.currentPlayerIndex && " 👑"}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Question */}
        {gameState.currentQuestion ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🎯 {getCurrentPlayer()}'s Turn
                </CardTitle>
                <Badge variant="outline" className="bg-white/10 border-white/20 text-lg py-2 px-3">
                  {categoryEmojis[gameState.currentQuestion.category] || '❓'} {gameState.currentQuestion.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed mb-6">
                {gameState.currentQuestion.question}
              </p>
              <Button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 cursor-pointer"
                size="lg"
              >
                <Shuffle className="h-5 w-5 mr-2" />
                Next Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">🎉 No More Questions!</h2>
              <p className="text-muted-foreground mb-6">
                You've gone through all {getTotalAvailableQuestions()} available questions in the selected categories.
              </p>
              <Button 
                onClick={resetGame} 
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Game
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App

