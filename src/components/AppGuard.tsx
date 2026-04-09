import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import ObjectSelector from '@/components/ObjectSelector';
import AppPage from '@/pages/App';
import Icon from '@/components/ui/icon';

export default function AppGuard() {
  const { user, currentObject, isLoading, sessionWarning } = useAuth();

  if (isLoading) return null;

  if (!user) return <LoginPage />;

  if (!currentObject) return <ObjectSelector />;

  return (
    <>
      {sessionWarning && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top">
          <Icon name="Clock" size={16} />
          Сессия будет завершена через 2 минуты из-за неактивности. Двигайте мышкой для продления.
        </div>
      )}
      <AppPage />
    </>
  );
}
