import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useAuth, RoleCode } from '@/contexts/AuthContext';

const roles: { code: RoleCode; name: string; desc: string; icon: string }[] = [
  { code: 'responsible', name: 'Ответственный за ПБ', desc: 'Ведение объектов, проверки, документация', icon: 'Shield' },
  { code: 'manager', name: 'Руководитель', desc: 'Анализ, контроль, KPI', icon: 'BarChart3' },
  { code: 'admin', name: 'Администратор', desc: 'Управление системой, поддержка', icon: 'Settings' },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RoleCode>('responsible');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let err: string | null;
    if (mode === 'login') {
      err = await login(email, password);
    } else {
      if (!fullName.trim()) {
        setError('Введите ФИО');
        setLoading(false);
        return;
      }
      err = await register({ email, password, full_name: fullName, role, phone, position });
    }

    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
            <Icon name="Flame" size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Журнал пожарной безопасности</h1>
          <p className="text-slate-400 mt-1">Система учёта и контроля ПБ</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</CardTitle>
            <CardDescription className="text-slate-400">
              {mode === 'login' ? 'Введите данные для входа' : 'Создайте учётную запись'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-slate-300">ФИО *</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Роль *</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as RoleCode)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.code} value={r.code}>
                            <div className="flex items-center gap-2">
                              <Icon name={r.icon} size={16} />
                              <div>
                                <span className="font-medium">{r.name}</span>
                                <span className="text-xs text-muted-foreground ml-2">{r.desc}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Телефон</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7..."
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Должность</Label>
                      <Input
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="Инженер"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Пароль *</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                  <Icon name="AlertCircle" size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    {mode === 'login' ? 'Вход...' : 'Регистрация...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon name={mode === 'login' ? 'LogIn' : 'UserPlus'} size={16} />
                    {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
