import { useEffect, useState } from 'react';

export default function LoadingIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-orange-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="absolute inset-0 border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent animate-pulse">
          Загрузка...
        </p>
      </div>
    </div>
  );
}
