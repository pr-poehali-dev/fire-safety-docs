import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import ObjectSelector from '@/components/ObjectSelector';
import AppPage from '@/pages/App';

export default function AppGuard() {
  const { user, currentObject, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <LoginPage />;

  if (!currentObject) return <ObjectSelector />;

  return <AppPage />;
}
