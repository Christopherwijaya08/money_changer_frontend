import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../api/apiClient'
import { mapBranch } from '../api/mappers'

const BranchContext = createContext(null)

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([])
  const [selectedBranchId, setSelectedBranchId] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get('/branches', { active_only: true })
        const loaded = res.data.map(mapBranch)
        setBranches(loaded)
        setSelectedBranchId((current) => current || loaded[0]?.id || '')
      } catch {
        // ponytail: silent — pages already render gracefully with an empty branch list
      }
    }
    load()
  }, [])

  return (
    <BranchContext.Provider value={{ branches, selectedBranchId, setSelectedBranchId }}>
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const ctx = useContext(BranchContext)
  if (!ctx) throw new Error('useBranch must be used within a BranchProvider')
  return ctx
}
