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
import { SUBSTANCES, SUBSTANCE_TYPE_LABELS, getSubstanceById } from '@/lib/sp12/substances';
import {
  calculateCategory,
  CalculationResult,
  CalculationInput,
  SubstanceEntry,
  CATEGORY_COLORS,
} from '@/lib/sp12/calculator';
import { authedFetch, DB_API } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

interface RowData {
  rowId: string;
  substanceId: string;
  quantity: string;
  massPerUnit: string;
  totalMass: string;
}

interface FormState {
  roomName: string;
  area: string;
  height: string;
  freeVolume: string;
  roomTemp: string;
  loadArea: string;
  emergencyVentilation: boolean;
  shutoffTime: string;
  rows: RowData[];
}

const makeRow = (substanceId = 'gasoline'): RowData => ({
  rowId: Math.random().toString(36).slice(2, 10),
  substanceId,
  quantity: '1',
  massPerUnit: '',
  totalMass: '',
});

const DEFAULT_FORM: FormState = {
  roomName: '',
  area: '',
  height: '',
  freeVolume: '',
  roomTemp: '20',
  loadArea: '',
  emergencyVentilation: false,
  shutoffTime: '120',
  rows: [makeRow()],
};

interface ValidationErrors {
  [key: string]: string;
}

interface HistoryEntry {
  id: number;
  room_name: string;
  category: string;
  calculated_at: string;
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

  const validate = (f: FormState): ValidationErrors => {
    const e: ValidationErrors = {};
    if (!f.roomName.trim()) e.roomName = 'Укажите наименование помещения';
    const area = parseFloat(f.area);
    if (!area || area <= 0) e.area = 'Площадь должна быть положительной';
    const height = parseFloat(f.height);
    if (!height || height <= 0) e.height = 'Высота должна быть положительной';
    if (f.rows.length === 0) {
      e.rows = 'Добавьте хотя бы одно вещество';
    } else {
      let hasMass = false;
      f.rows.forEach((r, idx) => {
        const total = parseFloat(r.totalMass);
        const qty = parseFloat(r.quantity);
        const mpu = parseFloat(r.massPerUnit);
        const rowMass = !isNaN(total) && total > 0 ? total : (qty > 0 && mpu > 0 ? qty * mpu : 0);
        if (rowMass > 0) hasMass = true;
        if (!r.substanceId) e[`row_${idx}_substance`] = 'Выберите вещество';
      });
      if (!hasMass) e.rows_mass = 'Укажите количество и массу хотя бы у одного вещества';
    }
    if (f.freeVolume && parseFloat(f.freeVolume) < 0) e.freeVolume = 'Свободный объём не может быть отрицательным';
    return e;
  };

  const buildInput = (f: FormState): CalculationInput | null => {
    const area = parseFloat(f.area);
    const height = parseFloat(f.height);
    if (!area || !height) return null;

    const substances: SubstanceEntry[] = f.rows
      .map((r) => {
        const sub = getSubstanceById(r.substanceId);
        if (!sub) return null;
        const total = parseFloat(r.totalMass);
        const qty = parseFloat(r.quantity);
        const mpu = parseFloat(r.massPerUnit);
        const finalMass = !isNaN(total) && total > 0 ? total : (qty > 0 && mpu > 0 ? qty * mpu : 0);
        if (finalMass <= 0) return null;
        return {
          rowId: r.rowId,
          substance: sub,
          quantity: !isNaN(qty) ? qty : undefined,
          massPerUnit: !isNaN(mpu) ? mpu : undefined,
          mass: finalMass,
        };
      })
      .filter((x): x is SubstanceEntry => x !== null);

    if (substances.length === 0) return null;

    return {
      roomName: f.roomName,
      area,
      height,
      freeVolume: f.freeVolume ? parseFloat(f.freeVolume) : undefined,
      roomTemp: f.roomTemp ? parseFloat(f.roomTemp) : 20,
      substances,
      loadArea: f.loadArea ? parseFloat(f.loadArea) : undefined,
      emergencyVentilation: f.emergencyVentilation,
      shutoffTime: f.shutoffTime ? parseFloat(f.shutoffTime) : 120,
    };
  };

  const performCalculation = (f: FormState) => {
    const errs = validate(f);
    setErrors(errs);
    const blockingErrors = Object.keys(errs).filter((k) => k !== 'roomName');
    if (blockingErrors.length > 0) {
      setResult(null);
      return;
    }
    const input = buildInput(f);
    if (!input) {
      setResult(null);
      return;
    }
    try {
      const res = calculateCategory(input);
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult(null);
    }
  };

  // АВТОПЕРЕСЧЁТ — debounce 400 мс на любое изменение формы
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performCalculation(form), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateRow = (rowId: string, patch: Partial<RowData>) => {
    setForm((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r)),
    }));
  };

  const addRow = () => {
    setForm((prev) => ({ ...prev, rows: [...prev.rows, makeRow()] }));
  };

  const removeRow = (rowId: string) => {
    setForm((prev) => ({ ...prev, rows: prev.rows.filter((r) => r.rowId !== rowId) }));
  };

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
    const input = buildInput(form);
    if (!input) return;
    try {
      const payload: Record<string, unknown> = {
        table: 'sp12_calculations',
        room_name: form.roomName,
        category: result.category,
        delta_p: result.deltaP || null,
        fire_load_q: result.Q || null,
        specific_load_g: result.g || null,
        input_data: JSON.stringify({
          ...input,
          substances: input.substances.map((s) => ({
            rowId: s.rowId,
            substanceId: s.substance.id,
            substanceName: s.substance.name,
            quantity: s.quantity,
            massPerUnit: s.massPerUnit,
            mass: s.mass,
          })),
        }),
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
        toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Ошибка', description: 'Сбой сохранения', variant: 'destructive' });
    }
  };

  const categoryRgb = (cat: string): [number, number, number] => {
    const map: Record<string, [number, number, number]> = {
      'А': [239, 68, 68], 'Б': [249, 115, 22], 'В1': [245, 158, 11],
      'В2': [251, 191, 36], 'В3': [250, 204, 21], 'В4': [253, 224, 71],
      'Г': [59, 130, 246], 'Д': [16, 185, 129],
    };
    return map[cat] || [100, 100, 100];
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

    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('1. Параметры помещения', margin, y);
    y += 5;
    setFontNormal(doc);
    doc.setFontSize(9);

    const headerRows: [string, string][] = [
      ['Наименование', form.roomName || '—'],
      ['Площадь, м²', form.area || '—'],
      ['Высота, м', form.height || '—'],
      ['V_св, м³', result.freeVolume.toFixed(2)],
      ['t°, °C', form.roomTemp || '20'],
      ['Площадь нагрузки, м²', form.loadArea || `${Math.min(parseFloat(form.area) || 0, 10)} (по умолч.)`],
      ['Аварийная вентиляция', form.emergencyVentilation ? 'есть' : 'нет'],
    ];

    headerRows.forEach(([k, v]) => {
      if (y > 275) { doc.addPage(); y = 18; }
      doc.setDrawColor(220);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
      doc.text(k, margin + 1, y);
      doc.text(v, margin + 80, y);
      y += 5;
    });

    y += 4;
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('2. Вещества в помещении', margin, y);
    y += 5;
    setFontNormal(doc);
    doc.setFontSize(8);

    // Таблица веществ
    const colWidths = [8, 80, 25, 30, 28];
    const headers = ['№', 'Вещество', 'Масса, кг', 'Q, МДж', 'ΔP, кПа'];
    let x = margin;
    headers.forEach((h, i) => {
      doc.rect(x, y - 4, colWidths[i], 6);
      setFontBold(doc);
      doc.text(h, x + 1, y);
      x += colWidths[i];
    });
    y += 6;
    setFontNormal(doc);
    result.contributions.forEach((c, idx) => {
      if (y > 270) { doc.addPage(); y = 18; }
      x = margin;
      const cells = [
        String(idx + 1),
        c.substanceName,
        c.totalMass.toFixed(1),
        c.Q.toFixed(1),
        c.deltaP !== undefined ? c.deltaP.toFixed(2) : '—',
      ];
      const wrapped = cells.map((cv, i) => doc.splitTextToSize(cv, colWidths[i] - 2));
      const maxH = Math.max(...wrapped.map((w) => w.length)) * 3.5 + 1.5;
      wrapped.forEach((lines, i) => {
        doc.rect(x, y - 4, colWidths[i], maxH);
        lines.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 3.5));
        x += colWidths[i];
      });
      y += maxH;
    });

    y += 6;
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('3. Промежуточные расчёты', margin, y);
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
        const fl = doc.splitTextToSize(`Формула: ${step.formula}`, pageWidth - margin * 2 - 4);
        doc.text(fl, margin + 4, y);
        y += fl.length * 4;
      }
      const vl = doc.splitTextToSize(step.value, pageWidth - margin * 2 - 4);
      doc.text(vl, margin + 4, y);
      y += vl.length * 4 + 2;
    });

    if (y > 245) { doc.addPage(); y = 18; }
    y += 4;
    setFontBold(doc);
    doc.setFontSize(10);
    doc.text('4. Результат', margin, y);
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
    const rl = doc.splitTextToSize(`Обоснование: ${result.reason}`, pageWidth - margin * 2 - 35);
    doc.text(rl, margin + 35, y);
    y += Math.max(12, rl.length * 4 + 2);

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

    doc.save(`Расчёт_категории_${form.roomName || 'помещение'}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Icon name="Calculator" className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <CardTitle>Расчёт категории помещения по СП 12.13130.2009</CardTitle>
              <CardDescription>
                Автоматический пересчёт при любом изменении данных. Можно добавлять любое количество веществ.
              </CardDescription>
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
              <Field label="Наименование помещения" error={errors.roomName} value={form.roomName} onChange={(v) => handleField('roomName', v)} placeholder="Цех №1" />
              <Field label="Площадь S, м²" error={errors.area} value={form.area} onChange={(v) => handleField('area', v)} type="number" />
              <Field label="Высота H, м" error={errors.height} value={form.height} onChange={(v) => handleField('height', v)} type="number" />
              <Field label="V_св, м³ (опц.)" error={errors.freeVolume} value={form.freeVolume} onChange={(v) => handleField('freeVolume', v)} type="number" placeholder="по умолч. S × H × 0,8" />
              <Field label="Температура, °C" value={form.roomTemp} onChange={(v) => handleField('roomTemp', v)} type="number" />
              <Field label="Площадь нагрузки, м²" value={form.loadArea} onChange={(v) => handleField('loadArea', v)} type="number" placeholder="не менее 10" />
            </div>
          </div>

          {/* Вещества — множественный ввод */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Icon name="FlaskConical" size={16} className="text-muted-foreground" />
                Вещества в помещении ({form.rows.length})
              </h4>
              <Button onClick={addRow} variant="outline" size="sm" className="gap-1.5 h-8">
                <Icon name="Plus" size={14} />
                Добавить вещество
              </Button>
            </div>

            {errors.rows_mass && (
              <Alert variant="destructive" className="mb-3">
                <Icon name="AlertCircle" size={16} />
                <AlertDescription className="text-xs">{errors.rows_mass}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {form.rows.map((row, idx) => (
                <SubstanceRow
                  key={row.rowId}
                  index={idx}
                  data={row}
                  canDelete={form.rows.length > 1}
                  onChange={(patch) => updateRow(row.rowId, patch)}
                  onDelete={() => removeRow(row.rowId)}
                />
              ))}
            </div>
          </div>

          {/* Доп. параметры */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Icon name="Settings2" size={16} className="text-muted-foreground" />
              Дополнительно
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Время отключения трубопровода, с" value={form.shutoffTime} onChange={(v) => handleField('shutoffTime', v)} type="number" />
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
                <Switch checked={form.emergencyVentilation} onCheckedChange={(c) => handleField('emergencyVentilation', c)} />
                <div>
                  <Label className="text-sm">Аварийная вентиляция</Label>
                  <p className="text-[11px] text-muted-foreground">Понижает категорию (СП 12 § 6.5)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mr-auto">
              <Icon name="Zap" size={13} className="text-amber-500" />
              Расчёт обновляется автоматически
            </div>
            <Button onClick={() => setForm(DEFAULT_FORM)} variant="outline" className="gap-2">
              <Icon name="RotateCcw" size={15} />
              Сбросить
            </Button>
            {result && objectId && (
              <Button onClick={handleSave} variant="outline" className="gap-2">
                <Icon name="Save" size={15} />
                Сохранить
              </Button>
            )}
            {result && (
              <Button onClick={handleExportPDF} variant="outline" className="gap-2">
                <Icon name="Download" size={15} />
                PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && <ResultBlock result={result} />}

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

interface SubstanceRowProps {
  index: number;
  data: RowData;
  canDelete: boolean;
  onChange: (patch: Partial<RowData>) => void;
  onDelete: () => void;
}

function SubstanceRow({ index, data, canDelete, onChange, onDelete }: SubstanceRowProps) {
  const sub = getSubstanceById(data.substanceId);
  const qty = parseFloat(data.quantity);
  const mpu = parseFloat(data.massPerUnit);
  const total = parseFloat(data.totalMass);
  const computedFromUnit = qty > 0 && mpu > 0 ? qty * mpu : 0;
  const effectiveMass = total > 0 ? total : computedFromUnit;

  return (
    <div className="p-3 rounded-lg border bg-muted/10 space-y-2">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
          {index + 1}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* Вещество */}
          <div className="md:col-span-5">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Вещество</Label>
            <Select value={data.substanceId} onValueChange={(v) => onChange({ substanceId: v })}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-80">
                {(['gas', 'lvzh', 'gzh', 'dust', 'solid'] as const).map((type) => (
                  <SelectGroup key={type}>
                    <SelectLabel className="text-[10px] uppercase tracking-wide">{SUBSTANCE_TYPE_LABELS[type]}</SelectLabel>
                    {SUBSTANCES.filter((s) => s.type === type).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Количество */}
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Кол-во, шт</Label>
            <Input
              type="number"
              value={data.quantity}
              onChange={(e) => onChange({ quantity: e.target.value })}
              placeholder="1"
              className="h-9 text-xs"
            />
          </div>

          {/* Масса единицы */}
          <div className="md:col-span-2">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">Масса 1 шт, кг</Label>
            <Input
              type="number"
              value={data.massPerUnit}
              onChange={(e) => onChange({ massPerUnit: e.target.value })}
              placeholder="0,5"
              className="h-9 text-xs"
            />
          </div>

          {/* Полная масса (опционально, переопределяет) */}
          <div className="md:col-span-3">
            <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">или Σ масса, кг</Label>
            <Input
              type="number"
              value={data.totalMass}
              onChange={(e) => onChange({ totalMass: e.target.value })}
              placeholder={computedFromUnit > 0 ? computedFromUnit.toFixed(2) : 'итог'}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {canDelete && (
          <Button
            onClick={onDelete}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 flex-shrink-0"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        )}
      </div>

      {/* Информация о веществе */}
      {sub && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pl-9">
          <span>Тип: <b className="text-foreground">{SUBSTANCE_TYPE_LABELS[sub.type]}</b></span>
          <span>Q_н: <b className="text-foreground">{sub.heatOfCombustion}</b> МДж/кг</span>
          {sub.flashPoint !== undefined && <span>t_всп: <b className="text-foreground">{sub.flashPoint}</b>°C</span>}
          {sub.vaporDensity !== undefined && <span>ρ: <b className="text-foreground">{sub.vaporDensity}</b> кг/м³</span>}
          {effectiveMass > 0 && (
            <span className="ml-auto text-emerald-600">
              Итого: <b>{effectiveMass.toFixed(2)} кг</b>
            </span>
          )}
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.deltaP !== undefined && (
              <Stat
                label="ΔP_max"
                value={`${result.deltaP.toFixed(2)} кПа`}
                hint={result.deltaP > 5 ? '> 5 кПа (взрывоопасно)' : '≤ 5 кПа'}
                color={result.deltaP > 5 ? 'red' : 'green'}
              />
            )}
            {result.Q !== undefined && <Stat label="Q (Σ нагрузка)" value={`${result.Q.toFixed(0)} МДж`} />}
            {result.g !== undefined && <Stat label="g (удельная)" value={`${result.g.toFixed(0)} МДж/м²`} />}
            <Stat label="V_св" value={`${result.freeVolume.toFixed(1)} м³`} />
          </div>

          {/* Вклад каждого вещества */}
          {result.contributions.length > 1 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-2 text-xs font-semibold flex items-center gap-2">
                <Icon name="ListPlus" size={13} />
                Вклад веществ ({result.contributions.length})
              </div>
              <table className="w-full text-xs">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="text-left px-3 py-1.5">Вещество</th>
                    <th className="text-right px-3 py-1.5">Масса, кг</th>
                    <th className="text-right px-3 py-1.5">Q, МДж</th>
                    <th className="text-right px-3 py-1.5">ΔP, кПа</th>
                  </tr>
                </thead>
                <tbody>
                  {result.contributions.map((c) => (
                    <tr key={c.rowId} className="border-t">
                      <td className="px-3 py-1.5">{c.substanceName}</td>
                      <td className="text-right px-3 py-1.5">{c.totalMass.toFixed(1)}</td>
                      <td className="text-right px-3 py-1.5">{c.Q.toFixed(1)}</td>
                      <td className="text-right px-3 py-1.5">
                        {c.deltaP !== undefined ? (
                          <span className={c.deltaP > 5 ? 'text-red-600 font-semibold' : ''}>
                            {c.deltaP.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
  const colorClass = color === 'red' ? 'text-red-600' : color === 'green' ? 'text-emerald-600' : 'text-foreground';
  return (
    <div className="p-3 rounded-lg border bg-muted/20">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-bold ${colorClass}`}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
