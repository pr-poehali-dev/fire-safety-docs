import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AUTH_URL = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';

interface ProtectionData {
  config: Record<string, string>;
  encryption: {
    algorithm: string;
    key_storage: string;
    key_configured: boolean;
    encrypted_users: number;
    total_users: number;
    pdn_fields: string[];
  };
  transport: {
    https_enforced: boolean;
    hsts_enabled: boolean;
    hsts_max_age: number;
    security_headers: string[];
  };
  backup_checklists: BackupCheck[];
}

interface BackupCheck {
  id: number;
  check_date: string;
  backup_verified: boolean;
  restore_tested: boolean;
  data_integrity_ok: boolean;
  encryption_verified: boolean;
  offsite_copy_ok: boolean;
  notes: string;
  created_at: string;
}

export default function DataProtectionSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProtectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewCheck, setShowNewCheck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCheck, setNewCheck] = useState({
    check_date: new Date().toISOString().split('T')[0],
    backup_verified: false,
    restore_tested: false,
    data_integrity_ok: false,
    encryption_verified: false,
    offsite_copy_ok: false,
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=data_protection`);
      setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveCheck = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=save_backup_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_backup_check', ...newCheck, performed_by: user?.id }),
      });
      if (res.ok) {
        toast({ title: 'Чек-лист сохранён' });
        setShowNewCheck(false);
        setNewCheck({ check_date: new Date().toISOString().split('T')[0], backup_verified: false, restore_tested: false, data_integrity_ok: false, encryption_verified: false, offsite_copy_ok: false, notes: '' });
        loadData();
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const fmt = (d: string) => {
    try { return new Date(d).toLocaleDateString('ru-RU'); } catch { return d; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
        <Icon name="Loader2" size={20} className="animate-spin" />
        Загрузка...
      </div>
    );
  }

  const enc = data?.encryption;
  const tr = data?.transport;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon name="Lock" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Шифрование данных</p>
                <p className="text-xs text-muted-foreground">Данные в покое</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Алгоритм:</span><Badge className="bg-green-100 text-green-700">{enc?.algorithm}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ключ:</span>{enc?.key_configured ? <Badge className="bg-green-100 text-green-700">Настроен</Badge> : <Badge className="bg-red-100 text-red-700">Не настроен</Badge>}</div>
              <div className="flex justify-between"><span className="text-muted-foreground">Хранение ключа:</span><span>Env-переменная</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Зашифровано:</span><span>{enc?.encrypted_users}/{enc?.total_users} пользователей</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Защита передачи</p>
                <p className="text-xs text-muted-foreground">Данные в транзите</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">HTTPS:</span><Badge className="bg-green-100 text-green-700">Принудительно</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">HSTS:</span><Badge className="bg-green-100 text-green-700">{tr?.hsts_max_age ? `${Math.floor(tr.hsts_max_age / 86400)} дн` : 'Вкл'}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">X-Frame-Options:</span><span>DENY</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">X-Content-Type:</span><span>nosniff</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Icon name="Database" size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Резервное копирование</p>
                <p className="text-xs text-muted-foreground">Бэкапы и восстановление</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Расписание:</span><Badge className="bg-green-100 text-green-700">Каждые 24ч</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Хранение:</span><span>{data?.config?.backup_retention_days || 90} дней</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Шифрование бэкапа:</span><Badge className="bg-green-100 text-green-700">Включено</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Проверок:</span><span>{data?.backup_checklists?.length || 0}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon name="FileKey" size={20} className="text-green-600" />
            Схема шифрования персональных данных
          </CardTitle>
          <CardDescription>AES-256-CBC с раздельным хранением ключей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Icon name="Lock" size={14} /> Шифруемые поля (ПДн)</h4>
              <div className="space-y-2">
                {(enc?.pdn_fields || []).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                    <Icon name="ShieldCheck" size={14} className="text-green-600" />
                    <span className="font-mono">{f}</span>
                    <Badge className="ml-auto bg-green-100 text-green-700 text-[10px]">AES-256</Badge>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-sm bg-green-50 p-2 rounded-lg border border-green-200">
                  <Icon name="ShieldCheck" size={14} className="text-green-600" />
                  <span className="font-mono">password</span>
                  <Badge className="ml-auto bg-blue-100 text-blue-700 text-[10px]">PBKDF2-SHA256 310k итер.</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2"><Icon name="Key" size={14} /> Управление ключами</h4>
              <div className="text-xs space-y-2 bg-slate-50 p-3 rounded-lg border">
                <p><span className="font-medium">Алгоритм:</span> AES-256-CBC (256-bit ключ)</p>
                <p><span className="font-medium">Деривация ключа:</span> SHA-256 от мастер-ключа</p>
                <p><span className="font-medium">IV:</span> Случайный 128-bit для каждого поля</p>
                <p><span className="font-medium">Хранение ключа:</span> Переменная окружения ENCRYPTION_KEY (не в коде)</p>
                <p><span className="font-medium">Паддинг:</span> PKCS#7</p>
                <p><span className="font-medium">Формат хранения:</span> Base64(IV + Ciphertext)</p>
              </div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mt-4"><Icon name="Globe" size={14} /> Заголовки безопасности</h4>
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border font-mono">
                <p>Strict-Transport-Security: max-age=31536000</p>
                <p>X-Content-Type-Options: nosniff</p>
                <p>X-Frame-Options: DENY</p>
                <p>X-XSS-Protection: 1; mode=block</p>
                <p>Referrer-Policy: strict-origin-when-cross-origin</p>
                <p>Cache-Control: no-store, no-cache</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="ClipboardCheck" size={20} className="text-amber-600" />
                Чек-лист тестового восстановления
              </CardTitle>
              <CardDescription>Ежемесячная проверка бэкапов и целостности данных</CardDescription>
            </div>
            <Button onClick={() => setShowNewCheck(!showNewCheck)} className="gap-1.5">
              <Icon name={showNewCheck ? 'X' : 'Plus'} size={14} />
              {showNewCheck ? 'Отмена' : 'Новая проверка'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewCheck && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
              <h4 className="font-semibold text-sm">Новая проверка бэкапа</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата проверки</Label>
                  <Input type="date" value={newCheck.check_date} onChange={(e) => setNewCheck(c => ({ ...c, check_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'backup_verified', label: 'Наличие бэкапа за последние 24ч подтверждено' },
                  { key: 'restore_tested', label: 'Тестовое восстановление из бэкапа выполнено успешно' },
                  { key: 'data_integrity_ok', label: 'Целостность данных после восстановления проверена' },
                  { key: 'encryption_verified', label: 'Шифрование бэкапа верифицировано' },
                  { key: 'offsite_copy_ok', label: 'Копия бэкапа в удалённом хранилище актуальна' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <Checkbox
                      checked={(newCheck as Record<string, boolean | string>)[item.key] as boolean}
                      onCheckedChange={(v) => setNewCheck(c => ({ ...c, [item.key]: !!v }))}
                    />
                    <label className="text-sm">{item.label}</label>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Примечания</Label>
                <Textarea value={newCheck.notes} onChange={(e) => setNewCheck(c => ({ ...c, notes: e.target.value }))} placeholder="Результаты проверки, замечания..." />
              </div>
              <Button onClick={handleSaveCheck} disabled={saving} className="gap-1.5">
                <Icon name={saving ? 'Loader2' : 'Save'} size={14} className={saving ? 'animate-spin' : ''} />
                {saving ? 'Сохранение...' : 'Сохранить проверку'}
              </Button>
            </div>
          )}

          {(data?.backup_checklists?.length || 0) > 0 ? (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead>Дата</TableHead>
                    <TableHead className="text-center">Бэкап</TableHead>
                    <TableHead className="text-center">Восстановление</TableHead>
                    <TableHead className="text-center">Целостность</TableHead>
                    <TableHead className="text-center">Шифрование</TableHead>
                    <TableHead className="text-center">Удалённая копия</TableHead>
                    <TableHead>Примечания</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.backup_checklists?.map((c) => (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell className="font-medium">{fmt(c.check_date)}</TableCell>
                      {[c.backup_verified, c.restore_tested, c.data_integrity_ok, c.encryption_verified, c.offsite_copy_ok].map((v, i) => (
                        <TableCell key={i} className="text-center">
                          <Icon name={v ? 'CheckCircle' : 'XCircle'} size={16} className={v ? 'text-green-500' : 'text-red-400'} />
                        </TableCell>
                      ))}
                      <TableCell className="max-w-[200px] truncate">{c.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="ClipboardList" size={40} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">Проверок пока нет. Рекомендуется проводить ежемесячно.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}