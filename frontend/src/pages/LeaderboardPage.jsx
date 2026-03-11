import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Award } from "lucide-react"
import { getLeaderboard } from "@/api/dataService"
import { Avatar } from "@/components/Avatar"

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const loadLeaderboard = async () => {
      const data = await getLeaderboard()
      setLeaderboard(data)
    }
    loadLeaderboard()
  }, [])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
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
        <h1 className="text-4xl font-bold mb-2">Лидерборд</h1>
        <p className="text-muted-foreground">
          Топ игроков по общему количеству очков
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Пока нет результатов в лидерборде</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Рейтинг игроков</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    getRankColor(entry.rank)
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar src={entry.avatar} alt={entry.username} size="lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{entry.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Пройдено викторин: {entry.totalQuizzes}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{entry.totalScore}</p>
                    <p className="text-sm text-muted-foreground">
                      Средний балл: {entry.averageScore}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LeaderboardPage

