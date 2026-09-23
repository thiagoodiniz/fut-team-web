import React from 'react'
import { Drawer, Typography, Input, Checkbox, theme, Button } from 'antd'
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons'

const { Text } = Typography

export interface SelectionOption {
  value: string
  label: string
  description?: string
  avatar?: React.ReactNode
}

interface SelectionDrawerProps {
  open: boolean
  title: string
  subtitle?: string
  options: SelectionOption[]
  value?: string | string[]
  multiple?: boolean
  searchPlaceholder?: string
  onClose: () => void
  onChange: (value: any) => void
  showRemove?: boolean
  onRemove?: () => void
  removeLabel?: string
}

export function SelectionDrawer({
  open,
  title,
  subtitle,
  options,
  value,
  multiple = false,
  searchPlaceholder = 'Buscar...',
  onClose,
  onChange,
  showRemove,
  onRemove,
  removeLabel = 'Remover',
}: SelectionDrawerProps) {
  const [search, setSearch] = React.useState('')
  const { token } = theme.useToken()

  // Clear search when opening
  React.useEffect(() => {
    if (open) {
      setSearch('')
    }
  }, [open])

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.description?.toLowerCase().includes(search.toLowerCase()),
  )

  function isSelected(optValue: string) {
    if (multiple) {
      return Array.isArray(value) && value.includes(optValue)
    }
    return value === optValue
  }

  function handleSelect(optValue: string) {
    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : []
      if (currentValues.includes(optValue)) {
        onChange(currentValues.filter((v) => v !== optValue))
      } else {
        onChange([...currentValues, optValue])
      }
    } else {
      onChange(optValue)
      onClose()
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      styles={{
        body: { padding: 0, maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
        header: { padding: '12px 16px 8px' },
      }}
      title={
        <div>
          <Text strong style={{ fontSize: 16 }}>
            {title}
          </Text>
          {subtitle && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {subtitle}
              </Text>
            </>
          )}
        </div>
      }
      footer={
        multiple ? (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${token.colorBorderSecondary}` }}>
            <Button type="primary" block size="large" onClick={onClose} style={{ borderRadius: 12 }}>
              Confirmar
            </Button>
          </div>
        ) : undefined
      }
      footerStyle={{ padding: 0 }}
    >
      {/* Search */}
      <div style={{ padding: '0 16px 8px' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          autoFocus={false}
          style={{ borderRadius: 24 }}
        />
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
        {showRemove && onRemove && (
          <div
            onClick={() => {
              onRemove()
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              cursor: 'pointer',
              color: token.colorError,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: token.colorErrorBg,
                flexShrink: 0,
              }}
            >
              <Text style={{ fontSize: 16 }}>✖</Text>
            </div>
            <Text style={{ color: token.colorError, fontWeight: 500 }}>
              {removeLabel}
            </Text>
          </div>
        )}

        {filteredOptions.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <Text type="secondary">Nenhuma opção encontrada</Text>
          </div>
        )}

        {filteredOptions.map((opt, i) => {
          const selected = isSelected(opt.value)

          return (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom:
                  i < filteredOptions.length - 1
                    ? `1px solid ${token.colorBorderSecondary}`
                    : 'none',
                cursor: 'pointer',
                background: selected ? token.colorPrimaryBg : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {opt.avatar ? (
                opt.avatar
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: token.colorFillQuaternary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text strong style={{ fontSize: 14 }}>
                    {opt.label.charAt(0).toUpperCase()}
                  </Text>
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ display: 'block', fontSize: 15 }}>
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                    {opt.description}
                  </Text>
                )}
              </div>

              {selected && (
                <CheckCircleFilled
                  style={{ color: token.colorPrimary, fontSize: 20 }}
                />
              )}
            </div>
          )
        })}
      </div>
    </Drawer>
  )
}
