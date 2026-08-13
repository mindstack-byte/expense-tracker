import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireAuth({ children, adminOnly = false }) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to="/" replace />
  if (!adminOnly && currentUser.role === 'admin') return <Navigate to="/admin" replace />
  return children
}
