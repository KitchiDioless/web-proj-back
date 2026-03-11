import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { getUserResults, updateUserAvatar, updateUser, getQuizById } from "@/api/dataService"
import { User, Trophy, Calendar, Upload, X, Edit2, Check, X as XIcon } from "lucide-react"
import { Avatar } from "@/components/Avatar"
import { fileToBase64, validateImage } from "@/utils/imageUtils"

const ProfilePage = () => {
  const { user, setUser } = useAuth()
  const [userResults, setUserResults] = useState([])
  const [quizzes, setQuizzes] = useState({})
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || "")

  useEffect(() => {
    const loadResults = async () => {
      if (user) {
        const results = await getUserResults(user.id)
        setUserResults(results)
        
        // Загружаем все викторины для результатов
        const quizzesMap = {}
        for (const result of results) {
          if (!quizzesMap[result.quizId]) {
            const quiz = await getQuizById(result.quizId)
            if (quiz) {
              quizzesMap[result.quizId] = quiz
            }
          }
        }
        setQuizzes(quizzesMap)
      }
    }
    loadResults()
  }, [user])

  useEffect(() => {
    setAvatarPreview(user?.avatar || null)
    setNewUsername(user?.username || "")
  }, [user?.avatar, user?.username])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImage(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    try {
      const base64 = await fileToBase64(file)
      const updatedUser = await updateUserAvatar(user.id, base64)
      if (updatedUser) {
        const userData = { ...updatedUser }
        delete userData.password
        // Сохраняем все данные пользователя, включая id
        const finalUserData = {
          ...userData,
          id: user.id, // Сохраняем id из текущего пользователя
          email: user.email, // Сохраняем email
          username: user.username, // Сохраняем username
          role: user.role, // Сохраняем роль
          createdAt: user.createdAt, // Сохраняем дату создания
        }
        setUser(finalUserData)
        setAvatarPreview(base64)
        localStorage.setItem("user", JSON.stringify(finalUserData))
        alert("Аватар успешно обновлен!")
      }
    } catch (error) {
      console.error("Ошибка при загрузке аватара:", error)
      alert("Ошибка при загрузке аватара")
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const updatedUser = await updateUserAvatar(user.id, null)
      if (updatedUser) {
        const userData = { ...updatedUser }
        delete userData.password
        // Сохраняем все данные пользователя
        const finalUserData = {
          ...userData,
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        }
        setUser(finalUserData)
        setAvatarPreview(null)
        localStorage.setItem("user", JSON.stringify(finalUserData))
      }
    } catch (error) {
      console.error("Ошибка при удалении аватара:", error)
      alert("Ошибка при удалении аватара")
    }
  }

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      alert("Имя пользователя не может быть пустым")
      return
    }

    if (newUsername === user.username) {
      setIsEditingUsername(false)
      return
    }

    try {
      const updatedUser = await updateUser(user.id, { username: newUsername.trim() })
      if (updatedUser) {
        const userData = { ...updatedUser }
        delete userData.password
        // Сохраняем все данные пользователя
        const finalUserData = {
          ...userData,
          id: user.id,
          email: user.email,
          username: newUsername.trim(),
          role: user.role,
          createdAt: user.createdAt,
        }
        setUser(finalUserData)
        setIsEditingUsername(false)
        localStorage.setItem("user", JSON.stringify(finalUserData))
        alert("Имя пользователя успешно обновлено!")
      }
    } catch (error) {
      console.error("Ошибка при обновлении имени пользователя:", error)
      alert("Ошибка при обновлении имени пользователя")
    }
  }

  const handleCancelUsernameEdit = () => {
    setNewUsername(user?.username || "")
    setIsEditingUsername(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Профиль</h1>
        <p className="text-muted-foreground">
          Ваша информация и результаты викторин
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Информация</TabsTrigger>
          <TabsTrigger value="results">Результаты</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Личная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Аватар</Label>
                <div className="flex items-center gap-4">
                  <Avatar src={avatarPreview} alt={user?.username} size="xl" />
                  <div className="space-y-2">
                    <label className="inline-block">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 cursor-pointer"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Загрузить аватар
                      </Button>
                    </label>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Удалить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Имя пользователя</Label>
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="flex-1"
                      placeholder="Введите новое имя"
                      maxLength={30}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveUsername}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Сохранить
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelUsernameEdit}
                      className="gap-2"
                    >
                      <XIcon className="h-4 w-4" />
                      Отмена
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold flex-1">{user?.username}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingUsername(true)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Изменить
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Роль</p>
                <p className="text-lg font-semibold capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Дата регистрации
                </p>
                <p className="text-lg font-semibold">{user?.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {userResults.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Вы еще не проходили викторины</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userResults.map((result) => {
                const quiz = quizzes[result.quizId]
                const completedAt = result.completedAt?.toDate?.() || result.completedAt
                const percentage = Math.round((result.score / result.totalQuestions) * 100)
                return (
                  <Card key={result.id}>
                    <CardHeader>
                      <CardTitle>{quiz?.title || "Неизвестная викторина"}</CardTitle>
                      <CardDescription>
                        {new Date(completedAt).toLocaleString("ru-RU")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {result.score} / {result.totalQuestions}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {percentage}% правильных ответов
                          </p>
                        </div>
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfilePage

