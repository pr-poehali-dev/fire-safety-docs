import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { SUBSTANCES, SUBSTANCE_TYPE_LABELS, getSubstanceById, Substance } from '@/lib/sp12/substances';
import { calculateCategory, CalculationResult, CalculationInput, CATEGORY_COLORS } from '@/lib/sp12/calculator';
import { authedFetch, DB_API } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

interface FormState {
  roomName: string;
  area: string;
  height: string;
  freeVolume: string;
  roomTemp: string;
  substanceId: string;
  mass: string;
  loadArea: string;
  emergencyVentilation: boolean;
  shutoffTime: string;
}

const DEFAULT_FORM: FormState = {
  roomName: '',
  area: '',
  height: '',
  freeVolume: '',
  roomTemp: '20',
  substanceId: 'gasoline',
  mass: '',
  loadArea: '',
  emergencyVentilation: false,
  shutoffTime: '120',
};

interface ValidationErrors {
  [key: string]: string;
}

interface HistoryEntry {
  id: number;
  room_name: string;
  category: string;
  calculated_at: string;
  input_data: CalculationInput;
  result: CalculationResult;
  user_email?: string;
}

interface CategoryCalculatorProps {
  objectId?: number;
}

export default function CategoryCalculator({ objectId }: CategoryCalculatorProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const substance = useMemo(() => getSubstanceById(form.substanceId) || SUBSTANCES[0], [form.substanceId]);

  const validate = (f: FormState): ValidationErrors => {
    const e: ValidationErrors = {};
    if (!f.roomName.trim()) e.roomName = 'Укажите наименование помещения';
    const area = parseFloat(f.area);
    if (!area || area <= 0) e.area = 'Площадь должна быть положительной';
    const height = parseFloat(f.height);
    if (!height || height <= 0) e.height = 'Высота должна быть положительной';
    const mass = parseFloat(f.mass);
    if (!f.mass || isNaN(mass) || mass < 0) e.mass = 'Масса должна быть ≥ 0';
    if (f.freeVolume && parseFloat(f.freeVolume) < 0) e.freeVolume = 'Свободный объём не может быть отрицательным';
    return e;
  };

  const buildInput = (f: FormState, sub: Substance): CalculationInput | null => {
    const area = parseFloat(f.area);
    const height = parseFloat(f.height);
    const mass = parseFloat(f.mass);
    if (!area || !height || isNaN(mass)) return null;
    return {
      roomName: f.roomName,
      area,
      height,
      freeVolume: f.freeVolume ? parseFloat(f.freeVolume) : undefined,
      roomTemp: f.roomTemp ? parseFloat(f.roomTemp) : 20,
      substance: sub,
      mass,
      loadArea: f.loadArea ? parseFloat(f.loadArea) : undefined,
      emergencyVentilation: f.emergencyVentilation,
      shutoffTime: f.shutoffTime ? parseFloat(f.shutoffTime) : 120,
    };
  };

  const performCalculation = (f: FormState, sub: Substance) => {
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setResult(null);
      return;
    }
    const input = buildInput(f, sub);
    if (!input) return;
    try {
      const res = calculateCategory(input);
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult(null);
    }
  };

  // Debounce 500ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performCalculation(form, substance), 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, substance.id]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecalculate = () => performCalculation(form, substance);

  const loadHistory = async () => {
    if (!objectId) return;
    try {
      const res = await authedFetch(`${DB_API}?table=sp12_calculations&object_id=${objectId}`);
      if (!res.ok) return;
      const rows = await res.json();
      setHistory(
        rows.map((r: Record<string, unknown>) => ({
          id: r.id as number,
          room_name: (r.room_name as string) || '',
          category: (r.category as string) || '',
          calculated_at: (r.calculated_at as string) || (r.created_at as string),
          input_data: typeof r.input_data === 'string' ? JSON.parse(r.input_data as string) : (r.input_data as CalculationInput),
          result: typeof r.result === 'string' ? JSON.parse(r.result as string) : (r.result as CalculationResult),
          user_email: r.user_email as string,
        })),
      );
    } catch (e) {
      console.error('History load error', e);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectId]);

  const handleSave = async () => {
    if (!result) return;
    const input = buildInput(form, substance);
    if (!input) return;
    try {
      const payload: Record<string, unknown> = {
        table: 'sp12_calculations',
        room_name: form.roomName,
        category: result.category,
        delta_p: result.deltaP || null,
        fire_load_q: result.Q || null,
        specific_load_g: result.g || null,
        input_data: JSON.stringify({ ...input, substance: { id: substance.id, name: substance.name } }),
        result: JSON.stringify(result),
        calculated_at: new Date().toISOString(),
      };
      if (objectId) payload.object_id = objectId;
      const res = await authedFetch(DB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast({ title: 'Сохранено', description: 'Расчёт занесён в историю' });
        loadHistory();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось сохранить расчёт', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Сбой сохранения', variant: 'destructive' });
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    const doc = await createPDF('p');
    const pageWidth = 210;
    const margin = 14;
    let y = 18;

    setFontBold(doc);
    doc.setFontSize(13);
    doc.text('РАСЧЁТ КАТЕГОРИИ ПОМЕЩЕНИЯ', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(10);
    doc.text('по пожарной и взрывопожарной опасности', pageWidth / 2, y, { align: 'center' });
    y += 4;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text('согласно СП 12.13130.2009', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Шапка
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('1. Исходные данные', margin, y);
    y += 5;
    setFontNormal(doc);
    doc.setFontSize(9);

    const rows: [string, string][] = [
      ['Наименование помещения', form.roomName || '—'],
      ['Площадь, м²', form.area || '—'],
      ['Высота, м', form.height || '—'],
      ['Свободный объём V_св, м³', result.freeVolume.toFixed(2)],
      ['Температура в помещении, °C', form.roomTemp || '20'],
      ['Вещество', substance.name],
      ['Тип', SUBSTANCE_TYPE_LABELS[substance.type]],
      ['Низшая теплота сгорания, МДж/кг', String(substance.heatOfCombustion)],
      ['Масса вещества, кг', form.mass],
      ['Площадь нагрузки, м²', form.loadArea || `${Math.min(parseFloat(form.area) || 0, 10)} (по умолч.)`],
      ['Аварийная вентиляция', form.emergencyVentilation ? 'есть' : 'нет'],
    ];

    rows.forEach(([k, v]) => {
      if (y > 275) { doc.addPage(); y = 18; }
      doc.setDrawColor(220);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      doc.text(k, margin + 1, y);
      doc.text(v, margin + 95, y);
      y += 5;
    });

    y += 4;
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('2. Промежуточные расчёты', margin, y);
    y += 5;
    setFontNormal(doc);
    doc.setFontSize(8.5);

    result.steps.forEach((step) => {
      if (y > 270) { doc.addPage(); y = 18; }
      setFontBold(doc);
      doc.text(`• ${step.label}:`, margin, y);
      y += 4;
      setFontNormal(doc);
      if (step.formula) {
        const formulaLines = doc.splitTextToSize(`Формула: ${step.formula}`, pageWidth - margin * 2 - 4);
        doc.text(formulaLines, margin + 4, y);
        y += formulaLines.length * 4;
      }
      const valueLines = doc.splitTextToSize(step.value, pageWidth - margin * 2 - 4);
      doc.text(valueLines, margin + 4, y);
      y += valueLines.length * 4 + 2;
    });

    if (y > 245) { doc.addPage(); y = 18; }
    y += 4;
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('3. Результат', margin, y);
    y += 7;
    const [r, g, b] = categoryRgb(result.category);
    doc.setFillColor(r, g, b);
    doc.rect(margin, y - 5, 30, 12, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text(`${result.category}`, margin + 15, y + 4, { align: 'center' });
    doc.setTextColor(0);
    setFontNormal(doc);
    doc.setFontSize(9);
    const reasonLines = doc.splitTextToSize(`Обоснование: ${result.reason}`, pageWidth - margin * 2 - 35);
    doc.text(reasonLines, margin + 35, y);
    y += Math.max(12, reasonLines.length * 4 + 2);

    if (result.warnings.length > 0) {
      y += 3;
      setFontBold(doc);
      doc.text('Примечания:', margin, y);
      y += 4;
      setFontNormal(doc);
      result.warnings.forEach((w) => {
        const wl = doc.splitTextToSize(`• ${w}`, pageWidth - margin * 2 - 4);
        doc.text(wl, margin + 4, y);
        y += wl.length * 4 + 1;
      });
    }

    if (y > 250) { doc.addPage(); y = 18; }
    y += 12;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text(`Дата расчёта: ${new Date().toLocaleDateString('ru-RU')}`, margin, y);
    y += 10;
    doc.text('Расчёт выполнил: _________________ /_________________ /', margin, y);
    y += 7;
    doc.text('Согласовано: _________________ /_________________ /', margin, y);

    const fileName = `Расчёт_категории_${form.roomName || 'помещение'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const categoryRgb = (cat: string): [number, number, number] => {
    const map: Record<string, [number, number, number]> = {
      'А': [239, 68, 68],
      'Б': [249, 115, 22],
      'В1': [245, 158, 11],
      'В2': [251, 191, 36],
      'В3': [250, 204, 21],
      'В4': [253, 224, 71],
      'Г': [59, 130, 246],
      'Д': [16, 185, 129],
    };
    return map[cat] || [100, 100, 100];
  };

  return (
    <div className="space-y-5">
      {/* Форма ввода */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Icon name="Calculator" className="text-white" size={20} />
            </div>
            <div>
              <CardTitle>Расчёт категории помещения по СП 12.13130.2009</CardTitle>
              <CardDescription>Автоматический расчёт с учётом избыточного давления взрыва и пожарной нагрузки</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Параметры помещения */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Home" size={16} className="text-muted-foreground" />
              Параметры помещения
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field
                label="Наименование помещения"
                error={errors.roomName}
                value={form.roomName}
                onChange={(v) => handleChange('roomName', v)}
                placeholder="Цех №1, Склад ГСМ"
              />
              <Field
                label="Площадь S, м²"
                error={errors.area}
                value={form.area}
                onChange={(v) => handleChange('area', v)}
                type="number"
                placeholder="например, 120"
              />
              <Field
                label="Высота H, м"
                error={errors.height}
                value={form.height}
                onChange={(v) => handleChange('height', v)}
                type="number"
                placeholder="например, 4"
              />
              <Field
                label="Свободный объём V_св, м³ (опц.)"
                error={errors.freeVolume}
                value={form.freeVolume}
                onChange={(v) => handleChange('freeVolume', v)}
                type="number"
                placeholder="по умолч. S × H × 0,8"
              />
              <Field
                label="Температура в помещении, °C"
                value={form.roomTemp}
                onChange={(v) => handleChange('roomTemp', v)}
                type="number"
              />
              <Field
                label="Площадь нагрузки, м² (опц.)"
                value={form.loadArea}
                onChange={(v) => handleChange('loadArea', v)}
                type="number"
                placeholder="не менее 10 м²"
              />
            </div>
          </div>

          {/* Вещество */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="FlaskConical" size={16} className="text-muted-foreground" />
              Горючее вещество
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Вещество</Label>
                <Select value={form.substanceId} onValueChange={(v) => handleChange('substanceId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-80">
                    {(['gas', 'lvzh', 'gzh', 'dust', 'solid'] as const).map((type) => (
                      <SelectGroup key={type}>
                        <SelectLabel className="text-[10px] uppercase tracking-wide">
                          {SUBSTANCE_TYPE_LABELS[type]}
                        </SelectLabel>
                        {SUBSTANCES.filter((s) => s.type === type).map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Field
                label="Масса m, кг"
                error={errors.mass}
                value={form.mass}
                onChange={(v) => handleChange('mass', v)}
                type="number"
                placeholder="например, 50"
              />
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
              <span>Q_н = <b className="text-foreground">{substance.heatOfCombustion}</b> МДж/кг</span>
              {substance.flashPoint !== undefined && (
                <span>t_всп = <b className="text-foreground">{substance.flashPoint}</b> °C</span>
              )}
              {substance.lcl !== undefined && (
                <span>НКПР = <b className="text-foreground">{substance.lcl}</b> %</span>
              )}
              {substance.vaporDensity !== undefined && (
                <span>ρ = <b className="text-foreground">{substance.vaporDensity}</b> кг/м³</span>
              )}
            </div>
          </div>

          {/* Доп. параметры */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Settings2" size={16} className="text-muted-foreground" />
              Дополнительно
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="Время отключения трубопровода, с"
                value={form.shutoffTime}
                onChange={(v) => handleChange('shutoffTime', v)}
                type="number"
              />
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <Switch
                  checked={form.emergencyVentilation}
                  onCheckedChange={(c) => handleChange('emergencyVentilation', c)}
                />
                <div>
                  <Label className="text-sm">Аварийная вентиляция</Label>
                  <p className="text-[11px] text-muted-foreground">Понижает категорию (СП 12 § 6.5)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button onClick={handleRecalculate} className="gap-2">
              <Icon name="RefreshCw" size={15} />
              Пересчитать
            </Button>
            <Button onClick={() => setForm(DEFAULT_FORM)} variant="outline" className="gap-2">
              <Icon name="RotateCcw" size={15} />
              Сбросить
            </Button>
            {result && objectId && (
              <Button onClick={handleSave} variant="outline" className="gap-2">
                <Icon name="Save" size={15} />
                Сохранить в историю
              </Button>
            )}
            {result && (
              <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                <Icon name="Download" size={15} />
                Экспорт PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Результат */}
      {result && <ResultBlock result={result} />}

      {/* История */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="History" size={16} />
              История расчётов
              <Badge variant="secondary">{history.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {history.map((h) => {
                const cat = h.category as keyof typeof CATEGORY_COLORS;
                const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS['Д'];
                return (
                  <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className={`w-12 h-10 rounded ${colors.bg} ${colors.text} flex items-center justify-center font-bold`}>
                      {h.category}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{h.room_name || '(без названия)'}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(h.calculated_at).toLocaleString('ru-RU')}
                        {h.user_email && ` • ${h.user_email}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}

function Field({ label, value, onChange, type = 'text', placeholder, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
      />
      {error && <p className="text-[11px] text-red-600 flex items-center gap-1"><Icon name="AlertCircle" size={11} />{error}</p>}
    </div>
  );
}

function ResultBlock({ result }: { result: CalculationResult }) {
  const colors = CATEGORY_COLORS[result.category];
  return (
    <Card className={`border-2 ${colors.border}`}>
      <CardContent className="p-0 overflow-hidden">
        <div className={`${colors.bg} ${colors.text} p-5 flex items-center gap-4`}>
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <span className="text-4xl font-bold">{result.category}</span>
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wide opacity-80">Категория помещения</div>
            <div className="text-xl font-bold">{colors.label}</div>
            <p className="text-sm opacity-90 mt-1">{result.reason}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Основные показатели */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.deltaP !== undefined && (
              <Stat
                label="ΔP (давление взрыва)"
                value={`${result.deltaP.toFixed(2)} кПа`}
                hint={result.deltaP > 5 ? '> 5 кПа (взрывоопасно)' : '≤ 5 кПа'}
                color={result.deltaP > 5 ? 'red' : 'green'}
              />
            )}
            {result.Q !== undefined && (
              <Stat label="Q (полная нагрузка)" value={`${result.Q.toFixed(0)} МДж`} />
            )}
            {result.g !== undefined && (
              <Stat label="g (удельная нагрузка)" value={`${result.g.toFixed(0)} МДж/м²`} />
            )}
            <Stat label="V_св (свободный объём)" value={`${result.freeVolume.toFixed(1)} м³`} />
            {result.Cst !== undefined && (
              <Stat label="C_st" value={`${result.Cst.toFixed(2)} %`} />
            )}
            {result.beta !== undefined && (
              <Stat label="β" value={result.beta.toFixed(3)} />
            )}
          </div>

          {/* Промежуточные шаги */}
          <details className="border rounded-lg" open>
            <summary className="cursor-pointer px-4 py-2.5 font-medium text-sm hover:bg-muted/30 select-none flex items-center gap-2">
              <Icon name="ListOrdered" size={14} />
              Промежуточные расчёты ({result.steps.length})
            </summary>
            <div className="px-4 py-3 border-t space-y-2 text-sm">
              {result.steps.map((step, i) => (
                <div key={i} className="flex flex-col gap-0.5 pb-2 border-b last:border-0 last:pb-0">
                  <div className="font-medium text-xs">{i + 1}. {step.label}</div>
                  {step.formula && (
                    <code className="text-[11px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded inline-block w-fit font-mono">
                      {step.formula}
                    </code>
                  )}
                  <div className="text-xs">{step.value}</div>
                </div>
              ))}
            </div>
          </details>

          {result.warnings.length > 0 && (
            <Alert>
              <Icon name="AlertTriangle" size={16} />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, hint, color }: { label: string; value: string; hint?: string; color?: 'red' | 'green' }) {
  const colorClass =
    color === 'red' ? 'text-red-600' : color === 'green' ? 'text-emerald-600' : 'text-foreground';
  return (
    <div className="p-3 rounded-lg border bg-muted/20">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}