import React from 'react'
import { InputNumber, type InputNumberProps } from 'antd'

const ALLOWED_KEYS = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
  ',',
  '.',
])

export type MoneyInputProps = Omit<
  InputNumberProps<number>,
  'prefix' | 'min' | 'precision' | 'decimalSeparator' | 'parser'
>

export function MoneyInput({ onKeyDown, ...props }: MoneyInputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      onKeyDown?.(e)
      return
    }

    const isDigit = /^[0-9]$/.test(e.key)
    if (!isDigit && !ALLOWED_KEYS.has(e.key)) {
      e.preventDefault()
      return
    }

    onKeyDown?.(e)
  }

  function handleBeforeInput(e: React.FormEvent<HTMLInputElement>) {
    const native = e.nativeEvent as InputEvent
    if (native.data && !/^[0-9.,]+$/.test(native.data)) {
      e.preventDefault()
    }
  }

  return (
    <InputNumber<number>
      prefix="R$"
      min={0}
      step={1}
      precision={2}
      decimalSeparator=","
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      controls={false}
      parser={(displayValue) => {
        const cleaned = (displayValue ?? '').replace(/[^\d.,]/g, '').replace(',', '.')
        if (!cleaned) return '' as unknown as number
        const parsed = parseFloat(cleaned)
        return Number.isNaN(parsed) ? ('' as unknown as number) : parsed
      }}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      {...props}
    />
  )
}
