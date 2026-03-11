import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { VirtualizedGameSelect } from "@/components/VirtualizedGameSelect"
import { addQuiz, getGames, getGameById } from "@/api/dataService"
import { getGameDescription } from "@/api/csvParser"
import { fileToBase64, validateImage } from "@/utils/imageUtils"
import { Plus, Trash2, Upload, X, Image as ImageIcon, Minus } from "lucide-react"
import { OptimizedInput } from "@/components/OptimizedInput"

// Компонент вопроса с мемоизацией
const QuestionCard = React.memo(({ question, qIndex, onQuestionChange, onRemove, onImageChange, onRemoveImage }) => {
  const handleAddOption = () => {
    const newOptions = [...question.options, ""]
    onQuestionChange(qIndex, "options", newOptions)
  }

  const handleRemoveOption = (optionIndex) => {
    if (question.options.length <= 2) return // Минимум 2 варианта
    const newOptions = question.options.filter((_, i) => i !== optionIndex)
    let newCorrectAnswer = question.correctAnswer
    if (optionIndex < question.correctAnswer) {
      newCorrectAnswer = question.correctAnswer - 1
    } else if (optionIndex === question.correctAnswer) {
      newCorrectAnswer = 0 // Если удалили правильный ответ, выбираем первый
    }
    onQuestionChange(qIndex, "options", newOptions)
    onQuestionChange(qIndex, "correctAnswer", newCorrectAnswer)
  }

  const handleOptionChange = useCallback((optionIndex, value) => {
    // Создаем новую копию массива опций с обновленным значением
    const currentOptions = question.options
    const newOptions = [...currentOptions]
    newOptions[optionIndex] = value
    onQuestionChange(qIndex, "options", newOptions)
  }, [question.options, qIndex, onQuestionChange])

  return (
    <Card className="p-4 border-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Вопрос {qIndex + 1}</Label>
          {onRemove && (
            <Button
              type="button"
              onClick={() => onRemove(qIndex)}
              variant="ghost"
              size="sm"
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Label>Текст вопроса</Label>
          <OptimizedInput
            value={question.text}
            onChange={(value) => onQuestionChange(qIndex, "text", value)}
            placeholder="Введите вопрос"
          />
        </div>

        <div className="space-y-2">
          <Label>Изображение для вопроса (опционально)</Label>
          {question.imagePreview ? (
            <div className="relative">
              <img
                src={question.imagePreview}
                alt={`Вопрос ${qIndex + 1}`}
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onRemoveImage(qIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="h-6 w-6 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Загрузить изображение
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    onImageChange(qIndex, file)
                  }
                }}
              />
            </label>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Варианты ответов</Label>
            <Button
              type="button"
              onClick={handleAddOption}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить вариант
            </Button>
          </div>
          {question.options.map((option, oIndex) => (
            <div key={oIndex} className="flex items-center gap-2">
              <OptimizedInput
                value={option}
                onChange={(value) => handleOptionChange(oIndex, value)}
                placeholder={`Вариант ${oIndex + 1}`}
                className="flex-1"
              />
              <input
                type="radio"
                name={`correct-${qIndex}`}
                checked={question.correctAnswer === oIndex}
                onChange={() => onQuestionChange(qIndex, "correctAnswer", oIndex)}
                className="h-4 w-4"
              />
              <Label className="text-xs whitespace-nowrap">Правильный</Label>
              {question.options.length > 2 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveOption(oIndex)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}, (prevProps, nextProps) => {
  // Кастомное сравнение для оптимизации - ре-рендер только если изменился этот конкретный вопрос
  return (
    prevProps.question.text === nextProps.question.text &&
    prevProps.question.correctAnswer === nextProps.question.correctAnswer &&
    prevProps.question.options.length === nextProps.question.options.length &&
    prevProps.question.options.every((opt, i) => opt === nextProps.question.options[i]) &&
    prevProps.question.image === nextProps.question.image &&
    prevProps.question.imagePreview === nextProps.question.imagePreview &&
    prevProps.qIndex === nextProps.qIndex
  )
})
QuestionCard.displayName = "QuestionCard"

const QuizBuilderPage = () => {
  const navigate = useNavigate()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [gameId, setGameId] = useState("")
  const [selectedGame, setSelectedGame] = useState(null)
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [questions, setQuestions] = useState([
    { text: "", options: ["", ""], correctAnswer: 0, image: null, imagePreview: null },
  ])

  useEffect(() => {
    const loadGames = async () => {
      try {
        const loadedGames = await getGames()
        setGames(loadedGames || [])
      } catch (error) {
        console.error('Error loading games:', error)
        setGames([])
      } finally {
        setLoading(false)
      }
    }
    loadGames()
  }, [])

  useEffect(() => {
    const loadGameInfo = async () => {
      if (gameId) {
        try {
          const game = await getGameById(gameId)
          setSelectedGame(game)
          if (game && !description) {
            setDescription(getGameDescription(game))
          }
        } catch (error) {
          console.error('Error loading game info:', error)
        }
      } else {
        setSelectedGame(null)
      }
    }
    loadGameInfo()
  }, [gameId]) // Убрал description из зависимостей

  const handleCoverImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      setCoverImage(base64)
      setCoverPreview(base64)
    } catch (error) {
      alert("Ошибка при загрузке изображения")
    }
  }, [])

  const handleQuestionImageChange = useCallback(async (qIndex, file) => {
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      setQuestions((prev) => {
        const newQuestions = [...prev]
        newQuestions[qIndex].image = base64
        newQuestions[qIndex].imagePreview = base64
        return newQuestions
      })
    } catch (error) {
      alert("Ошибка при загрузке изображения")
    }
  }, [])

  const handleAddQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, { text: "", options: ["", ""], correctAnswer: 0, image: null, imagePreview: null }])
  }, [])

  const handleRemoveQuestion = useCallback((index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleQuestionChange = useCallback((index, field, value) => {
    setQuestions((prev) => {
      const newQuestions = [...prev]
      if (field === "text") {
        newQuestions[index] = { ...newQuestions[index], text: value }
      } else if (field === "options") {
        newQuestions[index] = { ...newQuestions[index], options: value }
      } else if (field === "correctAnswer") {
        newQuestions[index] = { ...newQuestions[index], correctAnswer: parseInt(value) }
      }
      return newQuestions
    })
  }, [])

  const handleRemoveQuestionImage = useCallback((qIndex) => {
    setQuestions((prev) => {
      const newQuestions = [...prev]
      newQuestions[qIndex].image = null
      newQuestions[qIndex].imagePreview = null
      return newQuestions
    })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title || !description || !gameId) {
      alert("Заполните все обязательные поля")
      return
    }

    const validQuestions = questions.filter(
      (q) => q.text && q.options.every((opt) => opt.trim() !== "") && q.options.length >= 2
    )

    if (validQuestions.length === 0) {
      alert("Добавьте хотя бы один вопрос с заполненными вариантами ответов (минимум 2 варианта)")
      return
    }

    const quizData = {
      gameId: parseInt(gameId),
      title,
      description,
      coverImage,
      questions: validQuestions.map((q, index) => ({
        id: index + 1,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        image: q.image,
      })),
    }

    addQuiz(quizData)
    alert("Викторина успешно создана!")
    navigate("/quizzes")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p>Загрузка игр...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Конструктор викторин</h1>
        <p className="text-muted-foreground">
          Создайте новую викторину с изображениями
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
            <CardDescription>
              Заполните основную информацию о викторине
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="game">Игра *</Label>
              <VirtualizedGameSelect
                games={games}
                value={gameId}
                onChange={setGameId}
                selectedGame={selectedGame}
                getGameDescription={getGameDescription}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Название викторины *</Label>
              <OptimizedInput
                id="title"
                value={title}
                onChange={setTitle}
                placeholder="Викторина по..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <OptimizedInput
                id="description"
                value={description}
                onChange={setDescription}
                placeholder="Описание викторины"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Обложка викторины</Label>
              <div className="space-y-2">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Обложка"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setCoverImage(null)
                        setCoverPreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Нажмите для загрузки обложки
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Вопросы */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Вопросы</CardTitle>
                <CardDescription>
                  Добавьте вопросы для викторины
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={handleAddQuestion}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить вопрос
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, qIndex) => (
              <QuestionCard
                key={qIndex}
                question={question}
                qIndex={qIndex}
                onQuestionChange={handleQuestionChange}
                onRemove={questions.length > 1 ? handleRemoveQuestion : null}
                onImageChange={handleQuestionImageChange}
                onRemoveImage={handleRemoveQuestionImage}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" size="lg" className="flex-1">
            Создать викторину
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => navigate("/quizzes")}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}

export default QuizBuilderPage
