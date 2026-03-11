import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getQuizzes, getGames, getGameById } from "@/api/dataService"
import { QuizVoteButtons } from "@/components/QuizVoteButtons"
import { Play } from "lucide-react"

const QuizzesPage = () => {
  const [quizzes, setQuizzes] = useState([])
  const [gameNames, setGameNames] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadData = async () => {
      const loadedQuizzes = await getQuizzes()
      setQuizzes(loadedQuizzes)

      const names = {}
      for (const quiz of loadedQuizzes) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Викторины</h1>
        <p className="text-muted-foreground">
          Выберите викторину и проверьте свои знания
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Пока нет доступных викторин</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex gap-4">
                <div className="pt-4">
                  <QuizVoteButtons 
                    quiz={quiz} 
                    onVoteChange={() => setRefreshKey(k => k + 1)}
                  />
                </div>
                <div className="flex-1">
                  {quiz.coverImage && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={quiz.coverImage}
                        alt={quiz.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>
                      {getGameName(quiz.gameId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {quiz.description}
                    </p>
                    <p className="text-sm mb-4">
                      Вопросов: <span className="font-semibold">{quiz.questions.length}</span>
                    </p>
                    <Link to={`/quiz/${quiz.id}`}>
                      <Button className="w-full gap-2">
                        <Play className="h-4 w-4" />
                        Начать викторину
                      </Button>
                    </Link>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizzesPage

