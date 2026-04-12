import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useAuth, RoleCode } from '@/contexts/AuthContext';

const roles: { code: RoleCode; name: string; desc: string; icon: string }[] = [
  { code: 'responsible', name: 'Ответственный за ПБ', desc: 'Ведение объектов, проверки, документация', icon: 'Shield' },
  { code: 'manager', name: 'Руководитель', desc: 'Анализ, контроль, KPI', icon: 'BarChart3' },
  { code: 'admin', name: 'Администратор', desc: 'Управление системой, поддержка', icon: 'Settings' },
];

const passwordChecks = [
  { id: 'length', label: 'Минимум 12 символов', test: (p: string) => p.length >= 12 },
  { id: 'upper', label: 'Заглавная буква (A-Z, А-Я)', test: (p: string) => /[A-ZА-ЯЁ]/.test(p) },
  { id: 'lower', label: 'Строчная буква (a-z, а-я)', test: (p: string) => /[a-zа-яё]/.test(p) },
  { id: 'digit', label: 'Цифра (0-9)', test: (p: string) => /\d/.test(p) },
  { id: 'special', label: 'Спецсимвол (!@#$%^&*...)', test: (p: string) => /[!@#$%^&*()_+={}|;:,.<>?/\-[\]]/.test(p) },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RoleCode>('responsible');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const pwStrength = useMemo(() => {
    const passed = passwordChecks.filter(c => c.test(password));
    return { passed, score: Math.round((passed.length / passwordChecks.length) * 100) };
  }, [password]);

  const strengthColor = pwStrength.score < 40 ? 'bg-red-500' : pwStrength.score < 80 ? 'bg-yellow-500' : 'bg-green-500';
  const strengthLabel = pwStrength.score < 40 ? 'Слабый' : pwStrength.score < 80 ? 'Средний' : 'Надёжный';

  const isPasswordValid = pwStrength.score === 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAttemptsRemaining(null);
    setLockedUntil(null);
    setLoading(true);

    if (mode === 'register' && !isPasswordValid) {
      setError('Пароль не соответствует требованиям безопасности');
      setLoading(false);
      return;
    }

    let err: string | null;
    if (mode === 'login') {
      try {
        const loginBody: Record<string, string> = { action: 'login', email, password };
        if (captchaRequired && captchaAnswer) {
          loginBody.captcha_answer = captchaAnswer;
          loginBody.captcha_id = captchaId;
        }
        const res = await fetch('https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginBody),
        });
        const data = await res.json();
        if (data.captcha_required && data.captcha_question) {
          setCaptchaRequired(true);
          setCaptchaQuestion(data.captcha_question);
          setCaptchaId(data.captcha_id || '');
          setCaptchaAnswer('');
          setError('Требуется подтверждение — ответьте на вопрос ниже');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          if (data.attempts_remaining !== undefined) {
            setAttemptsRemaining(data.attempts_remaining);
          }
          if (data.locked_until) {
            setLockedUntil(data.locked_until);
          }
          if (data.captcha_required) {
            setCaptchaRequired(true);
          }
          err = data.error || 'Ошибка входа';
        } else {
          err = null;
          setCaptchaRequired(false);
          const loginResult = await login(email, password);
          if (loginResult) err = loginResult;
        }
      } catch {
        err = 'Ошибка соединения с сервером';
      }
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
          <h1 className="text-2xl font-bold text-white">Система управления ПБ</h1>
          <p className="text-slate-400 mt-1">Корпоративная платформа РУСАЛ</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white">{mode === 'login' ? 'Вход в систему' : 'Регистрация'}</CardTitle>
            <CardDescription className="text-slate-400">
              {mode === 'login' ? 'Используйте корпоративные учётные данные' : 'Создайте учётную запись'}
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
                              <span className="font-medium">{r.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="Инженер ПБ"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Корпоративный email *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ivanov@rusal.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Пароль *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Минимум 12 символов' : 'Введите пароль'}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={18} />
                  </button>
                </div>

                {mode === 'register' && password.length > 0 && (
                  <div className="space-y-2 mt-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Надёжность пароля</span>
                      <span className={`font-medium ${pwStrength.score < 40 ? 'text-red-400' : pwStrength.score < 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {strengthLabel}
                      </span>
                    </div>
                    <Progress value={pwStrength.score} className="h-1.5" indicatorClassName={strengthColor} />
                    <div className="space-y-1 mt-2">
                      {passwordChecks.map((check) => {
                        const passed = check.test(password);
                        return (
                          <div key={check.id} className={`flex items-center gap-2 text-xs ${passed ? 'text-green-400' : 'text-slate-500'}`}>
                            <Icon name={passed ? 'Check' : 'X'} size={12} />
                            <span>{check.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {captchaRequired && mode === 'login' && (
                <div className="space-y-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
                    <Icon name="ShieldQuestion" size={16} />
                    Подтвердите, что вы не робот
                  </div>
                  {captchaQuestion && (
                    <p className="text-white text-sm">{captchaQuestion}</p>
                  )}
                  <Input
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Введите ответ"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                  <Icon name={lockedUntil ? 'Lock' : 'AlertCircle'} size={16} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p>{error}</p>
                    {attemptsRemaining !== null && attemptsRemaining > 0 && (
                      <p className="text-xs text-red-400/70 mt-1">
                        После {attemptsRemaining} неудачн. попыток аккаунт будет заблокирован на 15 мин
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                disabled={loading || (mode === 'register' && !isPasswordValid)}
              >
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

              {mode === 'login' && (
                <div className="flex items-center gap-2 text-xs text-slate-500 justify-center mt-2">
                  <Icon name="Shield" size={12} />
                  <span>Блокировка после 5 неудачных попыток</span>
                </div>
              )}
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setAttemptsRemaining(null); setLockedUntil(null); }}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {mode === 'login' ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Icon name="Lock" size={10} />
            PBKDF2-SHA256
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Key" size={10} />
            JWT + Refresh
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Clock" size={10} />
            Автовыход 20 мин
          </span>
        </div>
      </div>
    </div>
  );
}