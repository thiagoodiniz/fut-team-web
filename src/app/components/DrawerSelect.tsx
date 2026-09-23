import React from 'react'
import { Input } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { SelectionDrawer, type SelectionOption } from './SelectionDrawer'

interface DrawerSelectProps {
  value?: string | string[]
  onChange?: (val: string | string[]) => void
  options: SelectionOption[]
  title: string
  subtitle?: string
  placeholder?: string
  searchPlaceholder?: string
  multiple?: boolean
  showRemove?: boolean
  onRemove?: () => void
  removeLabel?: string
  disabled?: boolean
}

export function DrawerSelect({
  value,
  onChange,
  options,
  title,
  subtitle,
  placeholder = 'Selecione',
  searchPlaceholder,
  multiple = false,
  showRemove,
  onRemove,
  removeLabel,
  disabled,
}: DrawerSelectProps) {
  const [open, setOpen] = React.useState(false)

  const displayValue = React.useMemo(() => {
    if (!value || (Array.isArray(value) && value.length === 0)) return ''
    if (multiple && Array.isArray(value)) {
      return value
        .map((v) => options.find((o) => o.value === v)?.label || v)
        .join(', ')
    }
    return options.find((o) => o.value === value)?.label || value
  }, [value, options, multiple])

  return (
    <>
      <div onClick={() => !disabled && setOpen(true)}>
        <Input
          readOnly
          placeholder={placeholder}
          value={displayValue}
          suffix={<DownOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }} />}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          disabled={disabled}
        />
      </div>

      <SelectionDrawer
        open={open}
        title={title}
        subtitle={subtitle}
        options={options}
        value={value}
        multiple={multiple}
        searchPlaceholder={searchPlaceholder}
        onClose={() => setOpen(false)}
        onChange={(val) => {
          onChange?.(val)
        }}
        showRemove={showRemove}
        onRemove={() => {
          onRemove?.()
          onChange?.(multiple ? [] : '')
        }}
        removeLabel={removeLabel}
      />
    </>
  )
}
