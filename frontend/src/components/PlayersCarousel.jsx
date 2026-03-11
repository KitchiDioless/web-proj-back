import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Trophy, Medal, Award, ChevronLeft, ChevronRight, Zap, Cpu, Gamepad2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from './Avatar'

export const PlayersCarousel = ({ players }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef(null)
  const scanlineRef = useRef(null)

  useEffect(() => {
    if (players.length <= 1) return

    // Автопрокрутка без эффекта глюка
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % players.length)
    }, 5000)

    // Анимация сканирующей линии
    const scanline = scanlineRef.current
    if (scanline) {
      const interval = setInterval(() => {
        scanline.style.top = '-100%'
        setTimeout(() => {
          scanline.style.transition = 'none'
          scanline.style.top = '100%'
          setTimeout(() => {
            scanline.style.transition = 'top 10s linear'
            scanline.style.top = '-100%'
          }, 10)
        }, 10000)
      }, 10000)
      return () => clearInterval(interval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [players.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % players.length)
    }, 5000)
  }

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + players.length) % players.length)
  }

  const goToNext = () => {
    goToSlide((currentIndex + 1) % players.length)
  }

  if (players.length === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto p-8 text-center">
        <div className="text-primary/50 font-mono text-lg tracking-wider">
          &gt; NO_PLAYER_DATA_FOUND
          <span className="animate-pulse">_</span>
        </div>
      </div>
    )
  }

  const currentPlayer = players[currentIndex]

  const getRankIcon = (index) => {
    const icons = [
      <Trophy key="gold" className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />,
      <Cpu key="silver" className="h-7 w-7 text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />,
      <Zap key="bronze" className="h-6 w-6 text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" />
    ]
    return icons[index] || <Gamepad2 className="h-5 w-5 text-green-400" />
  }

  const getRankColor = (index) => {
    const colors = [
      "bg-gradient-to-br from-yellow-900/30 to-yellow-950/10 border-2 border-yellow-500/30 shadow-[0_0_30px_rgba(250,204,21,0.2)]",
      "bg-gradient-to-br from-cyan-900/30 to-cyan-950/10 border-2 border-cyan-500/30 shadow-[0_0_25px_rgba(34,211,238,0.2)]",
      "bg-gradient-to-br from-purple-900/30 to-purple-950/10 border-2 border-purple-500/30 shadow-[0_0_20px_rgba(192,132,252,0.2)]"
    ]
    return colors[index] || "bg-gradient-to-br from-gray-900/30 to-gray-950/10 border-2 border-gray-500/30"
  }

  const getRankTitle = (index) => {
    const titles = ["LEGENDARY_GAMER", "COOL_GAMER", "BEGINNER_GAMER"]
    return titles[index] || "PLAYER"
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto font-mono">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        <div 
          ref={scanlineRef}
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ top: '-100%', transition: 'top 10s linear' }}
        />
      </div>

      <div className="relative">
        <Card className={cn(
          "relative overflow-hidden backdrop-blur-sm",
          getRankColor(currentIndex)
        )}>
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-primary/20 to-transparent flex items-center px-4">
            <div className="flex items-center gap-2 text-xs text-primary">
              <span className="animate-pulse">●</span>
              <span>PLAYER_ID: {currentPlayer.id || "NULL"}</span>
              <span className="ml-auto">STATUS: <span className="text-green-400">ACTIVE</span></span>
            </div>
          </div>

          <CardHeader className="pt-12">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
                
                <div className={cn(
                  "absolute inset-0 rounded-full border-2",
                  currentIndex === 0 ? "border-yellow-500/50" :
                  currentIndex === 1 ? "border-cyan-500/50" :
                  "border-purple-500/50"
                )} />
                
                <Avatar 
                  src={currentPlayer.avatar} 
                  alt={currentPlayer.username} 
                  className="relative w-full h-full border-2 border-background shadow-neon"
                />
                
                <div className="absolute -top-2 -right-2">
                  {getRankIcon(currentIndex)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs tracking-widest text-primary/70 uppercase">
                  {getRankTitle(currentIndex)}
                </div>
                
                <CardTitle className="text-3xl font-bold tracking-tighter">
                  <span className="text-primary">#</span>
                  <span className={cn(
                    currentIndex === 0 ? "text-yellow-300" :
                    currentIndex === 1 ? "text-cyan-300" :
                    "text-purple-300"
                  )}>
                    {currentIndex + 1}
                  </span>
                  <span className="ml-2 text-white">{currentPlayer.username}</span>
                </CardTitle>
                
                <CardDescription className="text-base text-muted-foreground">
                  <span className="text-primary">@</span>
                  {currentPlayer.username.toLowerCase().replace(/\s/g, '_')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent blur-sm" />
                <div>
                  <p className="text-5xl font-bold text-primary font-mono tracking-tighter">
                    {currentPlayer.totalScore}
                    <span className="text-2xl text-primary/50 ml-2">PTS</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 tracking-wider">
                    TOTAL_SCORE
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1 p-3 bg-background/50 rounded-lg border border-primary/10">
                  <div className="text-primary/70 tracking-wider">QUIZZES</div>
                  <div className="text-xl font-bold text-white">
                    {currentPlayer.totalQuizzes}
                  </div>
                  <div className="text-xs text-muted-foreground">COMPLETED</div>
                </div>
                
                <div className="space-y-1 p-3 bg-background/50 rounded-lg border border-primary/10">
                  <div className="text-primary/70 tracking-wider">AVG_SCORE</div>
                  <div className="text-xl font-bold text-white">
                    {currentPlayer.averageScore}
                  </div>
                  <div className="text-xs text-muted-foreground">PER_QUIZ</div>
                </div>
              </div>
            </div>
          </CardContent>

          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-transparent to-primary/20 flex items-center px-4">
            <div className="text-xs text-primary/50 tracking-wider flex gap-4">
              <span>SYNC: {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
              <span>VER: 1.0.0</span>
            </div>
          </div>
        </Card>
      </div>

      {players.length > 1 && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-center gap-8">
            <Button
              variant="outline"
              size="icon"
              className="relative border-primary/30"
              onClick={goToPrevious}
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full" />
              <ChevronLeft className="h-6 w-6 relative text-primary" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-primary/50 text-sm tracking-wider">PLAYER</span>
              <span className="text-2xl font-bold text-white font-mono">
                {String(currentIndex + 1).padStart(2, '0')}/{String(players.length).padStart(2, '0')}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="relative border-primary/30"
              onClick={goToNext}
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full" />
              <ChevronRight className="h-6 w-6 relative text-primary" />
            </Button>
          </div>

          <div className="flex justify-center gap-3">
            {players.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative"
                aria-label={`Перейти к игроку ${index + 1}`}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  index === currentIndex 
                    ? cn(
                        index === 0 ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]" :
                        index === 1 ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" :
                        "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.7)]"
                      )
                    : "bg-primary/30"
                )} />
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-primary/50">
            <div className="h-px w-8 bg-primary/30" />
            <span className="tracking-wider">AUTO_SCROLL: ACTIVE</span>
            <div className="h-px w-8 bg-primary/30" />
          </div>
        </div>
      )}
    </div>
  )
}