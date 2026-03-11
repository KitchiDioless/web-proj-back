import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getQuizzesByRating, getGameById, getQuizRating } from "@/api/dataService"
import { QuizVoteButtons } from "@/components/QuizVoteButtons"
import { Trophy, Medal, Award, Play } from "lucide-react"

const QuizLeaderboardPage = () => {
  const [quizzes, setQuizzes] = useState([])
  const [gameNames, setGameNames] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const sortedQuizzes = await getQuizzesByRating()
      setQuizzes(sortedQuizzes)

      const names = {}
      for (const quiz of sortedQuizzes) {
        if (!names[quiz.gameId]) {
          try {
            const game = await getGameById(quiz.gameId)
            names[quiz.gameId] = game?.name || "Неизвестная игра"
          } catch (error) {
            console.error(`Error loading game ${quiz.gameId}:`, error)
            names[quiz.gameId] = "Неизвестная игра"
          }
        }
      }
      setGameNames(names)
    }
    loadData()
  }, [refreshKey])

  const getGameName = (gameId) => {
    return gameNames[gameId] || "Загрузка..."
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>
  }

  const getRankColor = (rank) => {
    if (rank === 1) return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
    if (rank === 2) return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
    if (rank === 3) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
    return ""
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Лидерборд викторин</h1>
        <p className="text-muted-foreground">
          Рейтинг викторин по голосам сообщества
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Пока нет викторин в лидерборде</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {quizzes.map((quiz, index) => {
            const rank = index + 1
            const rating = getQuizRating(quiz)
            
            return (
              <Card
                key={quiz.id}
                className={`hover:shadow-lg transition-shadow ${getRankColor(rank)}`}
              >
                <div className="flex gap-4 p-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rank)}
                  </div>
                  <div className="pt-2">
                    <QuizVoteButtons 
                      quiz={quiz} 
                      onVoteChange={() => setRefreshKey(k => k + 1)}
                    />
                  </div>
                  <div className="flex-1">
                    {quiz.coverImage && (
                      <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
                        <img
                          src={quiz.coverImage}
                          alt={quiz.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="p-0 pb-2">
                      <CardTitle className="text-xl">{quiz.title}</CardTitle>
                      <CardDescription>
                        {getGameName(quiz.gameId)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          Вопросов: <span className="font-semibold">{quiz.questions.length}</span>
                        </span>
                        <span className="text-muted-foreground">
                          ↑ {quiz.upvotes || 0} ↓ {quiz.downvotes || 0}
                        </span>
                      </div>
                      <Link to={`/quiz/${quiz.id}`}>
                        <Button size="sm" className="gap-2">
                          <Play className="h-4 w-4" />
                          Начать викторину
                        </Button>
                      </Link>
                    </CardContent>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default QuizLeaderboardPage

