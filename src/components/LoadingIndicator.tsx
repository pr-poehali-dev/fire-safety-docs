import { useEffect, useState } from 'react';

export default function LoadingIndicator() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in">
      <div className="bg-card p-8 rounded-2xl shadow-2xl border border-border/50 flex flex-col items-center gap-5 animate-scale-in">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-[3px] border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-[3px] border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          Загрузка...
        </p>
      </div>
    </div>
  );
}
