import React, { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input'

export const OptimizedInput = React.memo(({ value, onChange, placeholder, ...props }) => {
  const [localValue, setLocalValue] = useState(value || '')
  const timeoutRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (value !== localValue && value !== undefined) {
      setLocalValue(value || '')
    }
  }, [value])

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (onChangeRef.current) {
        onChangeRef.current(newValue)
      }
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Input
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  )
})
OptimizedInput.displayName = 'OptimizedInput'

