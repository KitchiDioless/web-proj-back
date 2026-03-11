import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const AdminPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Админ-панель</h1>
        <p className="text-muted-foreground">
          Управление викторинами
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
    </div>
  )
}

export default AdminPage

