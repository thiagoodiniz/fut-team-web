import { useState } from 'react'

export function useAuthGate() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  function requireAuth(callback: () => void) {
    const token = localStorage.getItem('token')
    if (token) {
      callback()
    } else {
      setIsModalOpen(true)
    }
  }

  return { requireAuth, isModalOpen, setIsModalOpen }
}

