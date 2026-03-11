export const parseGamesCSV = async () => {
  try {
    const response = await fetch('/web-project/games.csv')
    const text = await response.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',')
    
    const games = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current)
          current = ''
        } else {
          current += char
        }
      }
      values.push(current)
      
      if (values.length < headers.length) continue
      
      let tags = []
      try {
        const tagsStr = values[9] || '[]'
        tags = JSON.parse(tagsStr.replace(/""/g, '"'))
      } catch (e) {
        tags = []
      }
      
      const game = {
        appid: parseInt(values[0]) || 0,
        name: values[1] || '',
        developer: values[2] || '',
        publisher: values[3] || '',
        rate: parseFloat(values[4]) || 0,
        windows: values[5] === '1',
        macos: values[6] === '1',
        linux: values[7] === '1',
        steamdeck: values[8] === '1',
        tags: tags,
        releaseYear: parseInt(values[10]) || null,
        releaseMonth: parseInt(values[11]) || null,
        currentPlayers: parseInt(values[12]) || 0,
        peak24h: parseInt(values[13]) || 0,
        allTimePeak: parseInt(values[14]) || 0,
      }
      
      if (game.name) {
        games.push(game)
      }
    }
    
    return games
  } catch (error) {
    console.error('Error parsing games CSV:', error)
    return []
  }
}

export const getGameDescription = (game) => {
  if (!game) return ''
  
  const parts = []
  
  if (game.developer) {
    parts.push(`Разработчик: ${game.developer}`)
  }
  
  if (game.publisher) {
    parts.push(`Издатель: ${game.publisher}`)
  }
  
  if (game.releaseYear) {
    parts.push(`Год выхода: ${game.releaseYear}`)
  }
  
  if (game.tags && game.tags.length > 0) {
    parts.push(`Жанры: ${game.tags.slice(0, 5).join(', ')}`)
  }
  
  if (game.rate > 0) {
    parts.push(`Рейтинг: ${game.rate.toFixed(1)}%`)
  }
  
  return parts.join(' • ')
}

