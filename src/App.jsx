import { useState } from "react";
import "./App.css";
import questionsData from "./assets/questions.json";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Badge } from "./components/ui/badge";
import { Checkbox } from "./components/ui/checkbox";
import { Users, Play, RotateCcw, Shuffle, Heart, X } from "lucide-react";

// Define categories with emojis outside the component
const categories = [
  ...questionsData.map(({ category, emoji }) => ({ category, emoji })),
];

// Get all category names for initial selection
const getAllCategoryNames = () => {
  return categories.map((cat) => cat.category);
};

// Player emojis for visual variety
const playerEmojis = ["🎯", "🎮", "🎲", "🎪", "🎨", "🎭", "🎸", "🎤"];

function App() {
  const [gameState, setGameState] = useState({
    players: [], // Each player: { name: string, health: number, emoji: string }
    currentPlayerIndex: 0,
    usedQuestions: new Set(),
    selectedCategories: getAllCategoryNames(), // Start with all categories selected
    gameStarted: false,
    currentQuestion: null,
    gameEnded: false,
    winner: null,
  });

  const [newPlayerName, setNewPlayerName] = useState("");

  const addPlayer = () => {
    if (newPlayerName.trim() && gameState.players.length < 8) {
      const emoji = playerEmojis[gameState.players.length];
      setGameState((prev) => ({
        ...prev,
        players: [
          ...prev.players,
          { name: newPlayerName.trim(), health: 3, emoji },
        ],
      }));
      setNewPlayerName("");
    }
  };

  const removePlayer = (index) => {
    setGameState((prev) => {
      const newPlayers = prev.players.filter((_, i) => i !== index);
      let newCurrentPlayerIndex = prev.currentPlayerIndex;

      if (index < prev.currentPlayerIndex) {
        newCurrentPlayerIndex = prev.currentPlayerIndex - 1;
      } else if (index === prev.currentPlayerIndex && newPlayers.length > 0) {
        newCurrentPlayerIndex = prev.currentPlayerIndex % newPlayers.length;
      }

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: Math.max(0, newCurrentPlayerIndex),
      };
    });
  };

  const kickPlayer = (index) => {
    if (gameState.players.length > 1) {
      removePlayer(index);
    }
  };

  const skipQuestion = () => {
    setGameState((prev) => {
      const newPlayers = [...prev.players];
      const currentPlayer = newPlayers[prev.currentPlayerIndex];

      // Reduce health by 1
      currentPlayer.health -= 1;

      // Check if player is eliminated
      if (currentPlayer.health <= 0) {
        // Remove the eliminated player
        newPlayers.splice(prev.currentPlayerIndex, 1);

        // Check if game is over (only one player left)
        if (newPlayers.length === 1) {
          return {
            ...prev,
            players: newPlayers,
            currentPlayerIndex: 0,
            gameStarted: false,
            gameEnded: true,
            winner: newPlayers[0],
            currentQuestion: null,
          };
        }

        // Adjust current player index after removal
        const newCurrentPlayerIndex =
          prev.currentPlayerIndex >= newPlayers.length
            ? 0
            : prev.currentPlayerIndex;

        // Don't advance turn when player is eliminated - stay on the same index
        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: newCurrentPlayerIndex,
        };
      } else {
        // Player still has health, advance to next player
        const nextPlayerIndex =
          (prev.currentPlayerIndex + 1) % newPlayers.length;
        return {
          ...prev,
          players: newPlayers,
          currentPlayerIndex: nextPlayerIndex,
        };
      }
    });
    nextQuestion();
  };

  const toggleCategory = (category) => {
    setGameState((prev) => {
      let newCategories;
      if (category === "All") {
        newCategories = prev.selectedCategories.includes("All") ? [] : ["All"];
      } else {
        const withoutAll = prev.selectedCategories.filter((c) => c !== "All");
        if (withoutAll.includes(category)) {
          newCategories = withoutAll.filter((c) => c !== category);
        } else {
          newCategories = [...withoutAll, category];
        }
      }
      return { ...prev, selectedCategories: newCategories };
    });
  };

  const selectAllCategories = () => {
    setGameState((prev) => ({
      ...prev,
      selectedCategories: getAllCategoryNames(),
    }));
  };

  const deselectAllCategories = () => {
    setGameState((prev) => ({
      ...prev,
      selectedCategories: [],
    }));
  };

  const areAllCategoriesSelected = () => {
    return gameState.selectedCategories.length === categories.length;
  };

  const getFilteredQuestions = () => {
    let filteredCategories;
    if (
      gameState.selectedCategories.includes("All") ||
      gameState.selectedCategories.length === 0
    ) {
      filteredCategories = questionsData;
    } else {
      filteredCategories = questionsData.filter(({ category }) =>
        gameState.selectedCategories.includes(category)
      );
    }
    return filteredCategories.flatMap(({ category, emoji, questions }) =>
      questions.map((question) => ({ question, category, emoji }))
    );
  };

  const getRandomQuestion = () => {
    const filteredQuestions = getFilteredQuestions();
    const availableQuestions = filteredQuestions.filter(
      (q) => !gameState.usedQuestions.has(q.question)
    );

    if (availableQuestions.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    return availableQuestions[randomIndex];
  };

  const startGame = () => {
    if (
      gameState.players.length >= 2 &&
      gameState.selectedCategories.length > 0
    ) {
      const firstQuestion = getRandomQuestion();
      setGameState((prev) => ({
        ...prev,
        gameStarted: true,
        gameEnded: false,
        winner: null,
        currentQuestion: firstQuestion,
        usedQuestions: firstQuestion
          ? new Set([firstQuestion.question])
          : new Set(),
      }));
    }
  };

  const nextQuestion = () => {
    const nextQuestion = getRandomQuestion();
    setGameState((prev) => ({
      ...prev,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      currentQuestion: nextQuestion,
      usedQuestions: nextQuestion
        ? new Set([...prev.usedQuestions, nextQuestion.question])
        : prev.usedQuestions,
    }));
  };

  const resetGame = () => {
    setGameState({
      players: [],
      currentPlayerIndex: 0,
      usedQuestions: new Set(),
      selectedCategories: getAllCategoryNames(), // Reset with all categories selected
      gameStarted: false,
      gameEnded: false,
      winner: null,
      currentQuestion: null,
    });
  };

  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
  };

  const getUsedQuestionsCount = () => {
    return gameState.usedQuestions.size;
  };

  const getTotalAvailableQuestions = () => {
    return getFilteredQuestions().length;
  };

  const renderHealthHearts = (health) => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <Heart
          key={i}
          className={`h-4 w-4 ${
            i < health ? "text-red-500 fill-red-500" : "text-gray-300"
          }`}
        />
      );
    }
    return hearts;
  };

  if (gameState.gameEnded && gameState.winner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center winner-card">
            <CardHeader>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent title-glow">
                🎉 Winner! 🎉
              </CardTitle>
            </CardHeader>
            <CardContent className="card-content-enhanced">
              <div className="mb-6">
                <Badge className="text-2xl py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 enhanced-badge border border-yellow-300/50 shadow-lg">
                  {gameState.winner.emoji} {gameState.winner.name} 👑
                </Badge>
              </div>
              <p className="text-lg mb-6">
                Congratulations! You're the last player standing!
              </p>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer enhanced-button"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 title-glow">
              🎯 Random Questions
            </h1>
            <p className="text-white/80">
              Get to know your friends, family, lovers, and enemies.
            </p>
          </div>

          <Card className="mb-6 enhanced-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({gameState.players.length}/8)
              </CardTitle>
              <CardDescription>
                Add players to participate (minimum 2 players required)
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-enhanced">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                  disabled={gameState.players.length >= 8}
                  className="enhanced-input"
                />
                <Button
                  onClick={addPlayer}
                  disabled={gameState.players.length >= 8}
                  className="cursor-pointer enhanced-button"
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {gameState.players.map((player, index) => (
                  <div key={index} className="relative group">
                    <Badge
                      variant="secondary"
                      className="text-base py-2 px-3 pr-8 enhanced-badge-secondary"
                    >
                      {player.emoji} {player.name}
                      <div className="flex ml-2">
                        {renderHealthHearts(player.health)}
                      </div>
                    </Badge>
                    <button
                      onClick={() => removePlayer(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600 shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {gameState.players.length < 2 && (
                <p className="text-sm text-yellow-600 mt-2">
                  ⚠️ You need at least 2 players to start the game
                </p>
              )}

              <div className="mt-6 md:hidden">
                <Button
                  onClick={startGame}
                  disabled={
                    gameState.players.length < 2 ||
                    gameState.selectedCategories.length === 0
                  }
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed enhanced-button"
                  size="lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz ({getTotalAvailableQuestions()} questions
                  available)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 enhanced-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>🎲 Categories</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={
                      areAllCategoriesSelected()
                        ? deselectAllCategories
                        : selectAllCategories
                    }
                    className="text-xs bg-white/10 border-white/20  hover:bg-white/20 cursor-pointer enhanced-button"
                  >
                    {areAllCategoriesSelected() ? "Deselect All" : "Select All"}
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Select which categories to include.
              </CardDescription>
            </CardHeader>
            <CardContent className="card-content-enhanced">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="category-item flex items-center gap-2"
                  >
                    <Checkbox
                      id={cat.category}
                      checked={gameState.selectedCategories.includes(
                        cat.category
                      )}
                      onCheckedChange={() => toggleCategory(cat.category)}
                      className="cursor-pointer enhanced-checkbox"
                    />
                    <label
                      htmlFor={cat.category}
                      className="text-sm font-medium leading-none cursor-pointer inline-flex items-center gap-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.category}</span>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="hidden md:block">
            <Button
              onClick={startGame}
              disabled={
                gameState.players.length < 2 ||
                gameState.selectedCategories.length === 0
              }
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed enhanced-button"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Quiz ({getTotalAvailableQuestions()} questions available)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white title-glow">
            🎯 Random Questions
          </h1>
          <Button
            onClick={resetGame}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer enhanced-button"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Game
          </Button>
        </div>
        <Card className="mb-6 enhanced-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>👥 Players</span>
              <Badge variant="secondary" className="enhanced-badge-secondary">
                Question {getUsedQuestionsCount()} of{" "}
                {getTotalAvailableQuestions()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="card-content-enhanced">
            <div className="flex flex-wrap gap-3">
              {gameState.players.map((player, index) => (
                <div key={index} className="relative group">
                  <Badge
                    variant={
                      index === gameState.currentPlayerIndex
                        ? "default"
                        : "secondary"
                    }
                    className={
                      index === gameState.currentPlayerIndex
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse text-lg py-3 px-4 font-bold enhanced-badge-primary player-badge-current"
                        : "text-base py-2 px-3 enhanced-badge-secondary player-badge"
                    }
                  >
                    {player.emoji} {player.name}
                    {index === gameState.currentPlayerIndex && " 👑"}
                    <div className="flex ml-2">
                      {renderHealthHearts(player.health)}
                    </div>
                  </Badge>
                  {gameState.players.length > 1 && (
                    <button
                      onClick={() => kickPlayer(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600 shadow-lg"
                      title="Kick player"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {gameState.currentQuestion ? (
          <Card className="mb-6 question-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🎯 {getCurrentPlayer()?.name}'s Turn
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-white/10 border-white/20 text-lg py-2 px-3 enhanced-badge"
                >
                  {gameState.currentQuestion.emoji}{" "}
                  {gameState.currentQuestion.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="card-content-enhanced">
              <p className="text-lg leading-relaxed mb-6">
                {gameState.currentQuestion.question}
              </p>
              <div className="separator-enhanced"></div>
              <div className="button-group">
                <Button
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 cursor-pointer enhanced-button"
                  size="lg"
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  Next Question
                </Button>
                <Button
                  onClick={skipQuestion}
                  variant="outline"
                  className="bg-red-500/20 border-red-500/50  hover:bg-red-500/30 cursor-pointer enhanced-button"
                  size="lg"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Skip (-1 ❤️)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 enhanced-card">
            <CardContent className="text-center py-12 card-content-enhanced">
              <h2 className="text-2xl font-bold mb-4 title-glow">
                🎉 No More Questions!
              </h2>
              <p className="text-muted-foreground mb-6">
                You've gone through all {getTotalAvailableQuestions()} available
                questions in the selected categories.
              </p>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 cursor-pointer enhanced-button"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Start New Game
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
