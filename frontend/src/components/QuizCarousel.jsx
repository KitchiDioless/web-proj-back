import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { QuizVoteButtons } from './QuizVoteButtons'
import { Play, ChevronLeft, ChevronRight, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getGameById } from '@/api/dataService'

export const QuizCarousel = ({ quizzes, getGameName }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [gameNames, setGameNames] = useState({})
  const [loadProgress, setLoadProgress] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    const loadGameNames = async () => {
      const names = {}
      let loaded = 0
      const total = quizzes.length
      
      for (const quiz of quizzes) {
        if (!names[quiz.gameId]) {
          try {
            const game = await getGameById(quiz.gameId)
            names[quiz.gameId] = game?.name || "UNKNOWN_GAME"
            loaded++
            setLoadProgress(Math.floor((loaded / total) * 100))
          } catch (error) {
            names[quiz.gameId] = "DATA_CORRUPTED"
            loaded++
            setLoadProgress(Math.floor((loaded / total) * 100))
          }
        }
      }
      setGameNames(names)
    }
    if (quizzes.length > 0) {
      loadGameNames()
    }
  }, [quizzes])

  useEffect(() => {
    if (quizzes.length <= 1) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quizzes.length)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [quizzes.length])

  const goToSlide = (index) => {
    setCurrentIndex(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quizzes.length)
    }, 5000)
  }

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + quizzes.length) % quizzes.length)
  }

  const goToNext = () => {
    goToSlide((currentIndex + 1) % quizzes.length)
  }

  if (quizzes.length === 0) {
    return (
      <div className="relative w-full max-w-4xl mx-auto p-12 text-center backdrop-blur-sm bg-background/50 border-2 border-primary/20 rounded-xl">
        <div className="space-y-4">
          <Terminal className="h-16 w-16 mx-auto text-primary/50 animate-pulse" />
          <div className="font-mono tracking-wider">
            <div className="text-primary text-lg">NO_QUIZZES_FOUND</div>
            <div className="text-muted-foreground text-sm mt-2">
              SYSTEM_MESSAGE: DATABASE_QUERY_RETURNED_EMPTY
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuiz = quizzes[currentIndex]
  const gameName = gameNames[currentQuiz.gameId] || "LOADING..."

  return (
    <div className="relative w-full max-w-5xl mx-auto font-mono">
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,200,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,200,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] animate-pulse" />
      </div>

      {loadProgress < 100 && (
        <div className="absolute -top-10 left-0 right-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-primary/70 tracking-wider">LOADING_ASSETS:</span>
            <div className="flex-1 h-2 bg-background/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <span className="text-primary font-bold">{loadProgress}%</span>
          </div>
        </div>
      )}

      <div className="relative">
        <Card className="relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-gray-900/80 via-background/90 to-gray-900/80 border-2 border-primary/20 shadow-[0_0_40px_rgba(0,200,255,0.1)] min-h-[630px]">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent flex items-center px-6 border-b border-primary/20">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-primary">▶</span>
              <span className="text-white/90">QUIZ_ID: {currentQuiz.id || "NULL"}</span>
              <span className="text-primary/70 ml-auto flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                STATUS: <span className="text-green-400">ACTIVE</span>
              </span>
            </div>
          </div>

          <div className="flex gap-6 pt-12 px-6">
            <div className="pt-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-primary/10 blur-sm rounded-lg" />
                <div className="relative bg-background/50 p-3 rounded-lg border border-primary/20">
                  <QuizVoteButtons quiz={currentQuiz} />
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {currentQuiz.coverImage && (
                <div className="relative w-full h-72 overflow-hidden rounded-lg border-2 border-primary/30">
                  <div className="absolute inset-0 bg-primary/10 blur-xl" />

                  <img
                    src={currentQuiz.coverImage}
                    alt={currentQuiz.title}
                    className="relative w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              )}

              <CardHeader className="px-0 pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold tracking-tight">
                        <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
                          {currentQuiz.title}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-base">
                        <span className="text-primary">GAME:</span>{' '}
                        <span className="text-white/90 font-medium">{gameName}</span>
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {currentQuiz.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs rounded-full border border-primary/30 bg-primary/10 text-primary font-mono tracking-wider"
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-0 pb-6">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-cyan-400 to-transparent" />
                    <p className="text-white/80 pl-4 leading-relaxed">
                      {currentQuiz.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground tracking-wider">
                        <span className="text-primary">QUESTIONS_COUNT:</span>
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {currentQuiz.questions.length}
                        <span className="text-sm text-primary/50 ml-2">UNITS</span>
                      </p>
                    </div>

                    <Link to={`/quiz/${currentQuiz.id}`}>
                      <Button 
                        className={cn(
                          "relative gap-3 px-8 py-6 rounded-xl",
                          "bg-gradient-to-r from-primary/20 to-cyan-500/20",
                          "border-2 border-primary/40",
                          "shadow-[0_0_20px_rgba(0,200,255,0.3)]"
                        )}
                      >
                        <div className="relative flex items-center gap-3">
                          <div className="text-left">
                            <div className="font-bold text-lg tracking-wider">
                              Начать квиз
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-transparent via-primary/10 to-transparent border-t border-primary/20 flex items-center px-6">
            <div className="text-xs text-primary/50 tracking-wider flex items-center gap-6">
              <span>VERSION: 1.0.0</span>
              <span>ENGINE: REACT_V17</span>
            </div>
          </div>
        </Card>
      </div>

      {quizzes.length > 1 && (
        <div className="mt-10 space-y-6">
          <div className="flex justify-center items-center gap-8">
            <Button
              variant="outline"
              size="icon"
              className="relative border-primary/30"
              onClick={goToPrevious}
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full" />
              <ChevronLeft className="h-6 w-6 relative text-primary" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xs text-primary/50 tracking-wider">CURRENT_QUIZ</div>
                <div className="text-3xl font-bold text-white font-mono">
                  {String(currentIndex + 1).padStart(2, '0')}
                  <span className="text-primary/50 mx-2">/</span>
                  {String(quizzes.length).padStart(2, '0')}
                </div>
              </div>
              
              <div className="flex gap-2">
                {quizzes.slice(
                  Math.max(0, currentIndex - 2),
                  Math.min(quizzes.length, currentIndex + 3)
                ).map((quiz, idx) => {
                  const actualIndex = Math.max(0, currentIndex - 2) + idx
                  return (
                    <button
                      key={quiz.id}
                      onClick={() => goToSlide(actualIndex)}
                      className={cn(
                        "relative w-16 h-12 rounded-lg overflow-hidden border-2",
                        actualIndex === currentIndex
                          ? "border-primary shadow-neon"
                          : "border-primary/20"
                      )}
                    >
                      {quiz.coverImage && (
                        <img
                          src={quiz.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-1 right-1 text-xs font-bold text-white">
                        {actualIndex + 1}
                      </div>
                    </button>
                  )
                })}
              </div>
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
            {quizzes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative"
                aria-label={`Перейти к викторине ${index + 1}`}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  index === currentIndex 
                    ? "bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_15px_rgba(0,200,255,0.7)]"
                    : "bg-primary/30"
                )} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}