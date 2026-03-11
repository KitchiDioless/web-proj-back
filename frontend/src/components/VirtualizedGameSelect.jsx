import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEM_HEIGHT = 36 // Высота одного элемента в пикселях
const VISIBLE_ITEMS = 10 // Количество видимых элементов
const BUFFER = 5 // Буфер элементов сверху и снизу

// Виртуализированный список игр
const VirtualizedGameList = React.memo(({ games, selectedValue, onSelect, searchTerm }) => {
  const [scrollTop, setScrollTop] = useState(0)
  const viewportRef = useRef(null)
  const containerRef = useRef(null)

  // Фильтрация игр по поисковому запросу
  const filteredGames = useMemo(() => {
    if (!searchTerm) return games
    const searchLower = searchTerm.toLowerCase()
    return games.filter((game) => game.name.toLowerCase().includes(searchLower))
  }, [games, searchTerm])

  // Вычисление видимых элементов
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER)
    const end = Math.min(
      filteredGames.length,
      start + VISIBLE_ITEMS + BUFFER * 2
    )
    return { start, end }
  }, [scrollTop, filteredGames.length])

  // Видимые элементы
  const visibleGames = useMemo(() => {
    return filteredGames.slice(visibleRange.start, visibleRange.end)
  }, [filteredGames, visibleRange])

  // Высота всего списка
  const totalHeight = filteredGames.length * ITEM_HEIGHT
  // Смещение для видимых элементов
  const offsetY = visibleRange.start * ITEM_HEIGHT

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return (
    <div
      ref={containerRef}
      className="max-h-[400px] overflow-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleGames.map((game, index) => {
            const actualIndex = visibleRange.start + index
            const gameId = (game.id || game.appid).toString()
            const isSelected = selectedValue === gameId

            return (
              <div
                key={game.id || game.appid}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  isSelected && "bg-accent text-accent-foreground"
                )}
                style={{ height: ITEM_HEIGHT }}
                onClick={() => onSelect(gameId)}
              >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  {isSelected && <Check className="h-4 w-4" />}
                </span>
                <span className="truncate">
                  {game.name} {game.releaseYear ? `(${game.releaseYear})` : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})
VirtualizedGameList.displayName = 'VirtualizedGameList'

// Компонент выбора игры с виртуализацией
export const VirtualizedGameSelect = ({ games, value, onChange, selectedGame, getGameDescription, required }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [localValue, setLocalValue] = useState(value || '')

  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const selectedGameData = useMemo(() => {
    if (!localValue) return null
    return games.find((g) => (g.id || g.appid).toString() === localValue)
  }, [games, localValue])

  const handleSelect = useCallback((gameId) => {
    setLocalValue(gameId)
    onChange(gameId)
    setIsOpen(false)
    setSearchTerm('')
  }, [onChange])

  const displayValue = selectedGameData
    ? `${selectedGameData.name}${selectedGameData.releaseYear ? ` (${selectedGameData.releaseYear})` : ''}`
    : 'Выберите игру'

  return (
    <div className="space-y-2">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between",
            !localValue && required && "border-destructive"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={cn("truncate", !localValue && "text-muted-foreground")}>
            {displayValue}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="p-2 border-b">
              <Input
                placeholder="Поиск игры..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <VirtualizedGameList
              games={games}
              selectedValue={localValue}
              onSelect={handleSelect}
              searchTerm={searchTerm}
            />
          </div>
        )}
      </div>
      {selectedGame && (
        <p className="text-sm text-muted-foreground">
          {getGameDescription(selectedGame)}
        </p>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

