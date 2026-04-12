import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';
const SERVICE_LIFE_YEARS = 10;
const conditionOptions = ['Исправна', 'Требует ремонта', 'Неисправна', 'На обслуживании', 'Не установлена', 'Не требуется'];
const HIDDEN_SYSTEM_KEYS = ['fire_water'];

interface ProtectionSystem {
  id: number;
  system_name: string;
  system_key: string;
  commissioning_date: string;
  project: string;
  complex_tests: string;
  condition: string;
  maintenance_contract: string;
  contract_expiry: string;
}

function getServiceLifeInfo(dateStr: string) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + SERVICE_LIFE_YEARS);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(Math.abs(diffDays) / 365);
  const months = Math.floor((Math.abs(diffDays) % 365) / 30);

  if (diffDays < 0) {
    return { expired: true, text: `Истёк ${years > 0 ? years + ' г. ' : ''}${months} мес. назад`, color: 'text-red-600', badge: 'bg-red-500' };
  }
  if (diffDays <= 365) {
    return { expired: false, text: `Осталось ${months > 0 ? months + ' мес.' : diffDays + ' дн.'}`, color: 'text-yellow-600', badge: 'bg-yellow-500' };
  }
  return { expired: false, text: `Осталось ${years} г. ${months} мес.`, color: 'text-green-600', badge: 'bg-green-500' };
}

function getContractStatus(expiryStr: string) {
  if (!expiryStr) return null;
  const expiry = new Date(expiryStr);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { expired: true, text: 'Истёк', color: 'text-red-600', badgeColor: 'bg-red-100 text-red-700 border-red-300' };
  }
  if (diffDays <= 30) {
    return { expired: false, text: `Истекает через ${diffDays} дн.`, color: 'text-yellow-600', badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
  }
  return { expired: false, text: 'Действует', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-700 border-green-300' };
}

interface ProtectionSystemsCardProps {
  objectId?: number;
  readOnly?: boolean;
}

export default function ProtectionSystemsCard({ objectId, readOnly }: ProtectionSystemsCardProps) {
  const { toast } = useToast();
  const [protectionSystems, setProtectionSystems] = useState<ProtectionSystem[]>([]);
  const [isEditingSystems, setIsEditingSystems] = useState(false);
  const [savingSystems, setSavingSystems] = useState(false);
  const [loadingSystems, setLoadingSystems] = useState(true);

  const fetchSystems = useCallback(async () => {
    setLoadingSystems(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const res = await fetch(`${API_URL}?table=protection_systems${objFilter}`);
      if (!res.ok) throw new Error('fetch error');
      const data = await res.json();
      setProtectionSystems(
        data
          .filter((row: Record<string, string>) => !HIDDEN_SYSTEM_KEYS.includes(row.system_key))
          .map((row: Record<string, string>) => ({
            ...row,
            commissioning_date: row.commissioning_date || '',
            project: row.project || '',
            complex_tests: row.complex_tests || '',
            condition: row.condition || '',
            maintenance_contract: row.maintenance_contract || '',
            contract_expiry: row.contract_expiry || '',
          }))
      );
    } catch (e) {
      console.error('Error loading protection systems:', e);
    } finally {
      setLoadingSystems(false);
    }
  }, [objectId]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  const updateSystem = (id: number, field: string, value: string) => {
    setProtectionSystems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSystems = async () => {
    setSavingSystems(true);
    try {
      for (const sys of protectionSystems) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'protection_systems',
            id: sys.id,
            commissioning_date: sys.commissioning_date || null,
            project: sys.project || null,
            complex_tests: sys.complex_tests || null,
            condition: sys.condition || null,
            maintenance_contract: sys.maintenance_contract || null,
            contract_expiry: sys.contract_expiry || null,
            ...(objectId ? { object_id: objectId } : {}),
          }),
        });
      }
      toast({ title: 'Сохранено', description: 'Данные систем противопожарной защиты обновлены' });
      setIsEditingSystems(false);
    } catch (e) {
      console.error('Error saving systems:', e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить системы', variant: 'destructive' });
    } finally {
      setSavingSystems(false);
    }
  };

  const isNotRequired = (condition: string) => condition === 'Не требуется';

  const exportSystemsPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const pw = 277;
    let y = 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ZHURNAL UCHETA SISTEM PROTIVOPOZHARNOJ ZASHCHITY', 10, y);
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data formirovaniya: ${new Date().toLocaleDateString('ru-RU')}`, 10, y);
    y += 4;
    doc.text(`Srok sluzhby sistem: ${SERVICE_LIFE_YEARS} let`, 10, y);
    y += 7;

    const cols = ['Sistema', 'Sostoyanie', 'Data vvoda', 'Srok sluzhby', 'Proekt', 'Kompl. ispytaniya', 'Dogovor TO', 'Srok dogovora'];
    const ws = [55, 28, 24, 28, 35, 35, 40, 32];

    const addRow = (cells: string[], bold = false) => {
      if (y > 185) { doc.addPage(); y = 15; }
      doc.setFontSize(7);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      let x = 10;
      let maxH = 5;
      cells.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, ws[i] - 2);
        maxH = Math.max(maxH, ls.length * 3 + 1);
      });
      cells.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, ws[i] - 2);
        ls.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 3));
        doc.rect(x, y - 3, ws[i], maxH);
        x += ws[i];
      });
      y += maxH;
    };

    addRow(cols, true);

    protectionSystems.forEach(sys => {
      const lifeInfo = getServiceLifeInfo(sys.commissioning_date);
      const contractInfo = getContractStatus(sys.contract_expiry);
      addRow([
        sys.system_name,
        sys.condition || 'Ne ukazano',
        sys.commissioning_date || '—',
        lifeInfo ? lifeInfo.text : '—',
        sys.project || '—',
        sys.complex_tests || '—',
        sys.maintenance_contract || 'Net',
        sys.contract_expiry ? `${sys.contract_expiry} (${contractInfo ? contractInfo.text : ''})` : '—',
      ]);
    });

    y += 8;
    const active = protectionSystems.filter(s => s.condition !== 'Не требуется');
    const ok = active.filter(s => s.condition === 'Исправна').length;
    const repair = active.filter(s => s.condition === 'Требует ремонта' || s.condition === 'Неисправна').length;
    const contracts = active.filter(s => s.maintenance_contract).length;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ITOGO:', 10, y); y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`Vsego aktivnyh sistem: ${active.length}`, 10, y); y += 4;
    doc.text(`Ispravny: ${ok} | Trebuyut remonta: ${repair}`, 10, y); y += 4;
    doc.text(`S dogovorom TO: ${contracts} iz ${active.length}`, 10, y); y += 8;

    doc.text('Podpis otvetstvennogo: _________________ / _________________ /', 10, y);

    doc.save(`zhurnal-sistem-pzh-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="ShieldCheck" size={24} className="text-purple-600" />
              Системы противопожарной защиты
            </CardTitle>
            <CardDescription>Установленные на объекте (срок службы — {SERVICE_LIFE_YEARS} лет)</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportSystemsPDF} variant="outline" size="sm" className="gap-1.5" disabled={loadingSystems}>
              <Icon name="Download" size={14} />
              PDF
            </Button>
            {!readOnly && (
              !isEditingSystems ? (
                <Button onClick={() => setIsEditingSystems(true)} variant="outline" className="gap-2">
                  <Icon name="Edit" size={16} />
                  Редактировать
                </Button>
              ) : (
                <>
                  <Button onClick={saveSystems} disabled={savingSystems} className="gap-2">
                    <Icon name={savingSystems ? 'Loader2' : 'Save'} size={16} className={savingSystems ? 'animate-spin' : ''} />
                    {savingSystems ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button onClick={() => { setIsEditingSystems(false); fetchSystems(); }} variant="outline" className="gap-2">
                    <Icon name="X" size={16} />
                    Отмена
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loadingSystems ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Icon name="Loader2" size={20} className="animate-spin" />
            <span className="text-sm">Загрузка систем...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {protectionSystems.map((system) => {
              const lifeInfo = getServiceLifeInfo(system.commissioning_date);
              const contractStatus = getContractStatus(system.contract_expiry);
              const dimmed = isNotRequired(system.condition);
              return (
                <div key={system.id} className={`p-4 bg-white dark:bg-slate-950 rounded-lg border space-y-3 ${dimmed ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{system.system_name}</h4>
                    <div className="flex items-center gap-2">
                      {system.condition === 'Не требуется' && (
                        <Badge variant="outline" className="text-slate-500 border-slate-300">Не требуется</Badge>
                      )}
                      {!dimmed && lifeInfo && (
                        <Badge className={lifeInfo.badge}>{lifeInfo.expired ? 'Срок истёк' : 'Действует'}</Badge>
                      )}
                      {!dimmed && !system.commissioning_date && system.condition !== 'Не требуется' && (
                        <Badge variant="outline" className="text-muted-foreground">Не заполнено</Badge>
                      )}
                      {!dimmed && contractStatus && (
                        <Badge variant="outline" className={contractStatus.badgeColor}>
                          <Icon name="FileCheck" size={12} className="mr-1" />
                          Договор: {contractStatus.text}
                        </Badge>
                      )}
                      {!dimmed && system.maintenance_contract && !system.contract_expiry && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          <Icon name="FileCheck" size={12} className="mr-1" />
                          Договор есть
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-3 ${dimmed && !isEditingSystems ? 'hidden' : ''}`}>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Дата ввода в эксплуатацию</Label>
                      {isEditingSystems ? (
                        <Input type="date" value={system.commissioning_date} onChange={(e) => updateSystem(system.id, 'commissioning_date', e.target.value)} className="h-9 text-sm" />
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.commissioning_date || '—'}</p>
                      )}
                      {lifeInfo && <p className={`text-xs ${lifeInfo.color} font-medium`}>{lifeInfo.text}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Проект</Label>
                      {isEditingSystems ? (
                        <Input value={system.project} onChange={(e) => updateSystem(system.id, 'project', e.target.value)} placeholder="№ проекта / наименование" className="h-9 text-sm" />
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.project || '—'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Комплексные испытания</Label>
                      {isEditingSystems ? (
                        <Input value={system.complex_tests} onChange={(e) => updateSystem(system.id, 'complex_tests', e.target.value)} placeholder="Дата / результат" className="h-9 text-sm" />
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.complex_tests || '—'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Состояние</Label>
                      {isEditingSystems ? (
                        <Select value={system.condition} onValueChange={(v) => updateSystem(system.id, 'condition', v)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Выберите" />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionOptions.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">
                          {system.condition ? (
                            <span className={`flex items-center gap-1.5 ${
                              system.condition === 'Исправна' ? 'text-green-600' :
                              system.condition === 'Неисправна' ? 'text-red-600' :
                              system.condition === 'Требует ремонта' ? 'text-yellow-600' :
                              system.condition === 'Не требуется' ? 'text-slate-400' : ''
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                system.condition === 'Исправна' ? 'bg-green-500' :
                                system.condition === 'Неисправна' ? 'bg-red-500' :
                                system.condition === 'Требует ремонта' ? 'bg-yellow-500' :
                                system.condition === 'На обслуживании' ? 'bg-blue-500' :
                                system.condition === 'Не требуется' ? 'bg-slate-400' : 'bg-gray-400'
                              }`} />
                              {system.condition}
                            </span>
                          ) : '—'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Договор на обслуживание</Label>
                      {isEditingSystems ? (
                        <Input value={system.maintenance_contract} onChange={(e) => updateSystem(system.id, 'maintenance_contract', e.target.value)} placeholder="№ договора / организация" className="h-9 text-sm" />
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">{system.maintenance_contract || '—'}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Срок действия договора</Label>
                      {isEditingSystems ? (
                        <Input type="date" value={system.contract_expiry} onChange={(e) => updateSystem(system.id, 'contract_expiry', e.target.value)} className="h-9 text-sm" />
                      ) : (
                        <p className="h-9 px-2 flex items-center bg-muted/50 rounded border text-sm">
                          {system.contract_expiry ? (
                            <span className={contractStatus ? contractStatus.color : ''}>
                              {system.contract_expiry}
                              {contractStatus && ` (${contractStatus.text})`}
                            </span>
                          ) : '—'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}