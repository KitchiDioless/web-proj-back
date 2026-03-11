import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, BookOpen, Users, Zap } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { QuizCarousel } from "@/components/QuizCarousel"
import { PlayersCarousel } from "@/components/PlayersCarousel"
import { getQuizzesByRating, getLeaderboard } from "@/api/dataService"

const HomePage = () => {
  const { isUser } = useAuth()
  const [topQuizzes, setTopQuizzes] = useState([])
  const [topPlayers, setTopPlayers] = useState([])

  useEffect(() => {
    const loadTopQuizzes = async () => {
      const quizzes = await getQuizzesByRating()
      setTopQuizzes(quizzes.slice(0, 5))
    }

    const loadTopPlayers = async () => {
      const leaderboard = await getLeaderboard()
      setTopPlayers(leaderboard.slice(0, 3))
    }

    loadTopQuizzes()
    loadTopPlayers()
  }, [])

  return (
    <div className="space-y-12">
      <section className="text-center space-y-6 py-12">
        <h1 className="text-6xl font-bold">
          Добро пожаловать в <span className="text-primary">Game Quiz</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Проверьте свои знания о любимых ПК играх! Проходите викторины, соревнуйтесь с другими игроками и поднимайтесь в рейтинге.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/quizzes">
            <Button size="lg" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Начать викторину
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button size="lg" variant="outline" className="gap-2">
              <Trophy className="h-5 w-5" />
              Лидерборд игроков
            </Button>
          </Link>
          <Link to="/quiz-leaderboard">
            <Button size="lg" variant="outline" className="gap-2">
              <BookOpen className="h-5 w-5" />
              Лидерборд викторин
            </Button>
          </Link>
        </div>
      </section>

      {topPlayers.length > 0 && (
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-5xl font-display font-bold mb-2 tracking-tight">Топ игроков</h2>
            <p className="text-muted-foreground text-lg">
              Лучшие игроки по общему количеству очков
            </p>
          </div>
          <PlayersCarousel players={topPlayers} />
          <div className="text-center">
            <Link to="/leaderboard">
              <Button variant="outline">Посмотреть полный лидерборд</Button>
            </Link>
          </div>
        </section>
      )}

      {topQuizzes.length > 0 && (
        <section className="space-y-4">
          <div className="text-center">
            <h2 className="text-5xl font-display font-bold mb-2 tracking-tight">Топ викторин</h2>
            <p className="text-muted-foreground text-lg">
              Самые популярные викторины по рейтингу сообщества
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <QuizCarousel quizzes={topQuizzes} />
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Множество викторин</CardTitle>
            <CardDescription>
              Викторины по самым популярным ПК играм
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Система рейтинга</CardTitle>
            <CardDescription>
              Соревнуйтесь с другими игроками и поднимайтесь в лидерборде
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Сообщество</CardTitle>
            <CardDescription>
              Присоединяйтесь к сообществу любителей игр
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      {!isUser() && (
        <section className="text-center py-12 bg-primary/5 rounded-lg">
          <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl font-bold mb-4">Начните прямо сейчас!</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Зарегистрируйтесь, чтобы сохранять свои результаты и участвовать в рейтинге
          </p>
          <Link to="/login">
            <Button size="lg">Зарегистрироваться</Button>
          </Link>
        </section>
      )}
    </div>
  )
}

export default HomePage

