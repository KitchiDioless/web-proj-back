import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getQuizzes, getUsers, updateQuiz, updateUser } from "@/api/backendService"
import { deleteQuiz } from "@/api/backendService"

const AdminPage = () => {
  const [users, setUsers] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [u, q] = await Promise.all([getUsers(), getQuizzes()])
      setUsers((u || []).map((x) => ({ ...x, _editRole: x.role, _editUsername: x.username })))
      setQuizzes((q || []).map((x) => ({ ...x, _editTitle: x.title, _editDescription: x.description || "" })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const saveUser = async (user) => {
    await updateUser(user.id, {
      username: user._editUsername,
      role: user._editRole,
    })
    await load()
  }

  const saveQuiz = async (quiz) => {
    await updateQuiz(quiz.id, {
      title: quiz._editTitle,
      description: quiz._editDescription,
    })
    await load()
  }

  const removeQuiz = async (quizId) => {
    await deleteQuiz(quizId)
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
        <p className="text-muted-foreground">
          Управление пользователями и викторинами
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Создание викторины</CardTitle>
          <CardDescription>
            Используйте конструктор викторин для создания новых викторин с поддержкой изображений
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/admin/quiz-builder">
            <Button size="lg" className="w-full gap-2">
              <Plus className="h-5 w-5" />
              Открыть конструктор викторин
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Пользователи</CardTitle>
          <CardDescription>Изменение имени и роли</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p>Загрузка...</p> : users.map((u) => (
            <div key={u.id} className="border rounded-lg p-4 space-y-3">
              <div className="text-sm text-muted-foreground">ID: {u.id} | {u.email}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Имя</Label>
                  <Input
                    value={u._editUsername}
                    onChange={(e) =>
                      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, _editUsername: e.target.value } : x))
                    }
                  />
                </div>
                <div>
                  <Label>Роль</Label>
                  <select
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={u._editRole}
                    onChange={(e) =>
                      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, _editRole: e.target.value } : x))
                    }
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={() => saveUser(u)} className="gap-2 w-full">
                    <Save className="h-4 w-4" /> Сохранить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Викторины</CardTitle>
          <CardDescription>Редактирование и удаление викторин</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? <p>Загрузка...</p> : quizzes.map((q) => (
            <div key={q.id} className="border rounded-lg p-4 space-y-3">
              <div className="text-sm text-muted-foreground">ID: {q.id} | gameId: {q.gameId}</div>
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  value={q._editTitle}
                  onChange={(e) =>
                    setQuizzes((prev) => prev.map((x) => x.id === q.id ? { ...x, _editTitle: e.target.value } : x))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Input
                  value={q._editDescription}
                  onChange={(e) =>
                    setQuizzes((prev) => prev.map((x) => x.id === q.id ? { ...x, _editDescription: e.target.value } : x))
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveQuiz(q)} className="gap-2">
                  <Save className="h-4 w-4" /> Сохранить
                </Button>
                <Button variant="destructive" onClick={() => removeQuiz(q.id)} className="gap-2">
                  <Trash2 className="h-4 w-4" /> Удалить
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPage

