import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { User, LogOut, Trophy, Home, BookOpen, Settings, Shield, Github, Mail, Info, HelpCircle } from "lucide-react"
import { Avatar } from "./Avatar"

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Game Quiz</span>
            </Link>

            <nav className="hidden md:flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" className="gap-2">
                  <Home className="h-4 w-4" />
                  Главная
                </Button>
              </Link>
              <Link to="/quizzes">
                <Button variant="ghost" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Викторины
                </Button>
              </Link>
              <Link to="/leaderboard">
                <Button variant="ghost" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Лидерборд игроков
                </Button>
              </Link>
              <Link to="/quiz-leaderboard">
                <Button variant="ghost" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Лидерборд викторин
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Avatar src={user.avatar} alt={user.username} size="sm" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Профиль
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button>Войти</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* О проекте */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">Game Quiz</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Платформа для создания и прохождения викторин по популярным ПК играм. 
                Проверьте свои знания, соревнуйтесь с другими игроками и поднимайтесь в рейтинге!
              </p>
            </div>

            {/* Навигация */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Навигация</h3>
              <nav className="flex flex-col gap-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Главная
                </Link>
                <Link to="/quizzes" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Викторины
                </Link>
                <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Лидерборд игроков
                </Link>
                <Link to="/quiz-leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Лидерборд викторин
                </Link>
              </nav>
            </div>

            {/* Аккаунт */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Аккаунт</h3>
              <nav className="flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Профиль
                    </Link>
                    {isAdmin() && (
                      <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Админ-панель
                      </Link>
                    )}
                  </>
                ) : (
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Войти / Зарегистрироваться
                  </Link>
                )}
              </nav>
            </div>

            {/* Контакты и информация */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Информация</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Версия 1.0.0</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HelpCircle className="h-4 w-4" />
                  <span>Поддержка</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>gamequiz@example.com</span>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Разделитель */}
          <div className="border-t pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Game Quiz. Все права защищены.
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">
                  Политика конфиденциальности
                </Link>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Условия использования
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout

