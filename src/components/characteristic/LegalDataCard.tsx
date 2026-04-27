import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LegalDataCardProps {
  objectId?: number;
  readOnly?: boolean;
}

interface LegalData {
  legal_name: string;
  inn: string;
  ogrn: string;
  actual_address: string;
  notification_email: string;
}

const AUTH_URL = 'https://functions.poehali.dev/a44dbf08-b20a-4c77-a799-0874d91052ae';

export default function LegalDataCard({ objectId, readOnly }: LegalDataCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<LegalData>({
    legal_name: '',
    inn: '',
    ogrn: '',
    actual_address: '',
    notification_email: '',
  });

  useEffect(() => {
    if (!objectId || !user) return;
    setLoading(true);
    fetch(`${AUTH_URL}?action=object&object_id=${objectId}`, {
      headers: { 'X-Auth-Token': user.token },
    })
      .then(r => r.ok ? r.json() : null)
      .then((obj) => {
        if (obj) {
          setData({
            legal_name: obj.legal_name || '',
            inn: obj.inn || '',
            ogrn: obj.ogrn || '',
            actual_address: obj.actual_address || '',
            notification_email: obj.notification_email || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [objectId, user]);

  const handleSave = async () => {
    if (!objectId || !user) return;
    if (data.inn && !/^\d{10}$|^\d{12}$/.test(data.inn.trim())) {
      toast({ title: 'ИНН должен содержать 10 или 12 цифр', variant: 'destructive' });
      return;
    }
    if (data.ogrn && !/^\d{13}$|^\d{15}$/.test(data.ogrn.trim())) {
      toast({ title: 'ОГРН должен содержать 13 или 15 цифр', variant: 'destructive' });
      return;
    }
    if (data.notification_email && !data.notification_email.includes('@')) {
      toast({ title: 'Некорректный email', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=update_object`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': user.token,
        },
        body: JSON.stringify({
          action: 'update_object',
          object_id: objectId,
          legal_name: data.legal_name,
          inn: data.inn,
          ogrn: data.ogrn,
          actual_address: data.actual_address,
          notification_email: data.notification_email.toLowerCase(),
        }),
      });
      if (res.ok) {
        toast({ title: 'Юридические данные сохранены' });
        setIsEditing(false);
      } else {
        toast({ title: 'Ошибка сохранения', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка соединения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (value: string, onChange: (v: string) => void, placeholder: string, sanitize?: (v: string) => string, maxLength?: number, type?: string) => {
    return isEditing ? (
      <Input
        value={value}
        onChange={(e) => onChange(sanitize ? sanitize(e.target.value) : e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        type={type || 'text'}
      />
    ) : (
      <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">{value || '—'}</p>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Icon name="Building" className="text-emerald-600" size={20} />
            </div>
            <div>
              <CardTitle className="text-base">Юридические данные и уведомления</CardTitle>
              <CardDescription className="text-xs">
                ИНН и ОГРН шифруются в базе (AES-256)
              </CardDescription>
            </div>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                    {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                    Сохранить
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
                  <Icon name="Pencil" size={14} />
                  Редактировать
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground gap-2 text-sm">
            <Icon name="Loader2" size={16} className="animate-spin" />
            Загрузка...
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Наименование юридического лица</Label>
              {renderField(data.legal_name, (v) => setData(p => ({ ...p, legal_name: v })), 'ООО «Компания»')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  ИНН
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-1 border-emerald-200 text-emerald-700">
                    <Icon name="Lock" size={9} />
                    Шифр.
                  </Badge>
                </Label>
                {renderField(
                  data.inn,
                  (v) => setData(p => ({ ...p, inn: v })),
                  '10 или 12 цифр',
                  (v) => v.replace(/\D/g, ''),
                  12,
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  ОГРН
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 gap-1 border-emerald-200 text-emerald-700">
                    <Icon name="Lock" size={9} />
                    Шифр.
                  </Badge>
                </Label>
                {renderField(
                  data.ogrn,
                  (v) => setData(p => ({ ...p, ogrn: v })),
                  '13 или 15 цифр',
                  (v) => v.replace(/\D/g, ''),
                  15,
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Фактический адрес</Label>
              {renderField(data.actual_address, (v) => setData(p => ({ ...p, actual_address: v })), 'Если отличается от юридического')}
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="flex items-center gap-1.5">
                <Icon name="Mail" size={14} className="text-blue-600" />
                Email для уведомлений
              </Label>
              {renderField(data.notification_email, (v) => setData(p => ({ ...p, notification_email: v })), 'otvetstvenny@company.ru', undefined, undefined, 'email')}
              <p className="text-[11px] text-muted-foreground">
                На этот email приходят уведомления о ТО, проверках, тренировках, истечении сроков
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
