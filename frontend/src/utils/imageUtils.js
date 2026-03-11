// Утилиты для работы с изображениями

// Конвертация файла в base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

// Валидация изображения
export const validateImage = (file) => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (!file) {
    return { valid: false, error: 'Файл не выбран' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Неподдерживаемый формат. Используйте JPEG, PNG, GIF или WebP' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Размер файла не должен превышать 5MB' }
  }
  
  return { valid: true }
}

