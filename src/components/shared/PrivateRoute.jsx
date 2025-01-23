import { Navigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import LoadingSpinner from './LoadingSpinner'

const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useUser()

  if (isLoading) return <LoadingSpinner />
  
  return user ? children : <Navigate to="/login" />
}

export default PrivateRoute
