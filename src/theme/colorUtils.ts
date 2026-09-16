/**
 * Utilitários para manipulação e adaptação de cores do clube
 * Compatível com padrões de acessibilidade WCAG 2.1
 */

export type RGB = { r: number; g: number; b: number }
export type HSL = { h: number; s: number; l: number }

export function hexToRgb(hex: string): RGB | null {
  const cleanHex = hex.replace('#', '').trim()
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16)
    const g = parseInt(cleanHex[1] + cleanHex[1], 16)
    const b = parseInt(cleanHex[2] + cleanHex[2], 16)
    return { r, g, b }
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16)
    const g = parseInt(cleanHex.slice(2, 4), 16)
    const b = parseInt(cleanHex.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h /= 6
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let rPrime = 0
  let gPrime = 0
  let bPrime = 0

  if (h >= 0 && h < 60) {
    rPrime = c
    gPrime = x
  } else if (h >= 60 && h < 120) {
    rPrime = x
    gPrime = c
  } else if (h >= 120 && h < 180) {
    gPrime = c
    bPrime = x
  } else if (h >= 180 && h < 240) {
    gPrime = x
    bPrime = c
  } else if (h >= 240 && h < 300) {
    rPrime = x
    bPrime = c
  } else if (h >= 300 && h < 360) {
    rPrime = c
    bPrime = x
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  }
}

/**
 * Retorna a luminância relativa conforme especificação WCAG 2.1
 * Intervalo de 0 (preto absoluto) a 1 (branco puro)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0.5

  const srgb = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

/**
 * Retorna taxa de contraste entre duas cores hex (ex: 4.5:1 -> 4.5)
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1)
  const lum2 = getLuminance(hex2)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Ajusta a cor do clube para manter legibilidade e contraste adequado
 * no tema atual (Dark ou Light), preservando o matiz (identidade)
 */
export function adjustClubColorForTheme(
  hex: string | null | undefined,
  isDark: boolean,
  fallback = isDark ? '#22c55e' : '#16a34a',
): string {
  if (!hex) return fallback

  const rgb = hexToRgb(hex)
  if (!rgb) return fallback

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  if (isDark) {
    // No Dark Mode, se a cor for muito escura (ex: preto, azul marinho, verde escuro),
    // elevamos a luminosidade para que não se perca contra superfícies escuras (#111827).
    if (hsl.l < 45) {
      const adjustedL = Math.max(52, Math.min(65, hsl.l + 30))
      const adjustedS = Math.max(60, hsl.s)
      const adjustedRgb = hslToRgb(hsl.h, adjustedS, adjustedL)
      return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
    }

    // Se for branco ou cinza muito claro, abaixamos levemente para evitar ofuscamento
    if (hsl.l > 88 && hsl.s < 20) {
      return '#e2e8f0'
    }

    return hex
  } else {
    // No Light Mode, se a cor for muito clara (ex: amarelo muito brilhante, branco),
    // reduzimos a luminosidade para ter contraste legível contra fundo branco (#ffffff).
    if (hsl.l > 68 && hsl.s > 30) {
      const adjustedL = Math.min(46, hsl.l - 25)
      const adjustedRgb = hslToRgb(hsl.h, hsl.s, adjustedL)
      return rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b)
    }

    // Se for muito próxima de branco (ex: cinza claríssimo)
    if (hsl.l > 85) {
      return '#334155'
    }

    return hex
  }
}

/**
 * Converte hex para rgba com opacidade desejada
 */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * Retorna '#ffffff' ou '#0f172a' baseado em qual tem maior contraste contra a cor informada
 */
export function getAccessibleTextColor(
  backgroundHex: string,
  lightText = '#ffffff',
  darkText = '#0f172a',
): string {
  const contrastWithWhite = getContrastRatio(backgroundHex, '#ffffff')
  const contrastWithDark = getContrastRatio(backgroundHex, '#0f172a')
  return contrastWithWhite >= contrastWithDark ? lightText : darkText
}

