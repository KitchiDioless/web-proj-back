import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { voteQuiz, getUserVote, getQuizRating, getQuizById } from '@/api/dataService'
import { useAuth } from '@/context/AuthContext'

export const QuizVoteButtons = ({ quiz, onVoteChange }) => {
  const { user } = useAuth()
  const [currentQuiz, setCurrentQuiz] = useState(quiz)
  const [currentVote, setCurrentVote] = useState(null)
  
  useEffect(() => {
    const loadData = async () => {
      const updatedQuiz = await getQuizById(quiz.id)
      if (updatedQuiz) {
        setCurrentQuiz(updatedQuiz)
      }
      if (user) {
        const vote = await getUserVote(user.id, quiz.id)
        setCurrentVote(vote)
      }
    }
    loadData()
  }, [quiz.id, user])

  const rating = getQuizRating(currentQuiz)

  const handleVote = async (voteType) => {
    if (!user) {
      alert('Войдите, чтобы голосовать')
      return
    }

    // Если кликнули на уже выбранный голос, отменяем его
    const newVote = currentVote === voteType ? null : voteType
    const updatedQuiz = await voteQuiz(user.id, quiz.id, newVote)
    
    if (updatedQuiz) {
      setCurrentQuiz(updatedQuiz)
      setCurrentVote(newVote)
    }
    
    if (onVoteChange) {
      onVoteChange()
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          currentVote === 'up' && "text-primary bg-primary/10"
        )}
        onClick={() => handleVote('up')}
        disabled={!user}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <span className={cn(
        "text-sm font-semibold min-w-[2rem] text-center",
        rating > 0 && "text-green-600",
        rating < 0 && "text-red-600"
      )}>
        {rating}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          currentVote === 'down' && "text-destructive bg-destructive/10"
        )}
        onClick={() => handleVote('down')}
        disabled={!user}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  )
}

