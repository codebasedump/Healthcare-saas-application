import { useUser } from '../hooks/useUser';
import { Navigate } from 'react-router-dom';

export default function withAccessControl(Component) {
  return function Protected(props) {
    const { user } = useUser();
    if (user?.status === 'suspended') {
      return <Navigate to="/suspended" replace />;
    }
    return <Component {...props} />;
  };
}