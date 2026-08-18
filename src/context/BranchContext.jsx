import { createContext, useContext, useState } from 'react'
import { branches } from '../mocks/data'

const activeBranches = branches.filter((b) => b.isActive)

const BranchContext = createContext(null)

export function BranchProvider({ children }) {
  const [selectedBranchId, setSelectedBranchId] = useState(activeBranches[0]?.id ?? '')

  return (
    <BranchContext.Provider value={{ branches: activeBranches, selectedBranchId, setSelectedBranchId }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within a BranchProvider')
  return ctx
}
