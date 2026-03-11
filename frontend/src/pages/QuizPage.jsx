import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getQuizById, addQuizResult } from "@/api/dataService"
import { useAuth } from "@/context/AuthContext"
import { CheckCircle2, XCircle, Trophy } from "lucide-react"

const QuizPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isUser } = useAuth()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true)
      const loadedQuiz = await getQuizById(id)
      setQuiz(loadedQuiz)
      setLoading(false)
      
      // Проверяем после загрузки
      if (!loadedQuiz) {
        navigate("/quizzes")
        return
      }
      if (!isUser()) {
        navigate("/login")
        return
      }
    }
    loadQuiz()
  }, [id, navigate, isUser])

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Загрузка викторины...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return null
  }

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNext = async () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correctAnswer
    const newScore = isCorrect ? score + 1 : score
    setAnswers([...answers, { questionId: quiz.questions[currentQuestion].id, answer: selectedAnswer, isCorrect }])
    
    if (isCorrect) {
      setScore(newScore)
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      // Викторина завершена
      if (user) {
        await addQuizResult({
          userId: user.id,
          quizId: quiz.id,
          score: newScore,
          totalQuestions: quiz.questions.length,
        })
      }
      setShowResult(true)
    }
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setAnswers([])
    setScore(0)
    setShowResult(false)
  }

  if (showResult) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Викторина завершена!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-primary">{score} / {quiz.questions.length}</p>
              <p className="text-xl text-muted-foreground">{percentage}% правильных ответов</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Детали ответов:</h3>
              {quiz.questions.map((question, qIndex) => {
                const userAnswer = answers[qIndex]
                const isCorrect = userAnswer?.isCorrect
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        {question.image && (
                          <div className="mb-3">
                            <img
                              src={question.image}
                              alt="Вопрос"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <p className="font-medium mb-2">{question.text}</p>
                        <p className="text-sm text-muted-foreground">
                          Ваш ответ: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {question.options[userAnswer?.answer]}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Правильный ответ: <span className="text-green-600">
                              {question.options[question.correctAnswer]}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRestart} className="flex-1">
                Пройти снова
              </Button>
              <Button onClick={() => navigate("/quizzes")} variant="outline" className="flex-1">
                К списку викторин
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-muted-foreground">
          Вопрос {currentQuestion + 1} из {quiz.questions.length}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{question.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.image && (
            <div className="w-full mb-4">
              <img
                src={question.image}
                alt="Вопрос"
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="w-full mt-6"
            size="lg"
          >
            {currentQuestion < quiz.questions.length - 1 ? "Следующий вопрос" : "Завершить викторину"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizPage

