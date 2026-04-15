import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

interface JournalSectionProps {
  sectionId: string;
  title: string;
  icon: string;
  color: string;
  fields: Array<{ key: string; label: string; type?: string; span?: number }>;
  headerFields?: Array<{ key: string; label: string; type?: string }>;
  onSave: (data: Record<string, string>) => void;
  data?: Record<string, string>[];
  objectId?: number;
}

interface JournalEntry {
  id: number;
  entry_data: Record<string, string>;
  created_at: string;
}

export default function JournalSection({
  sectionId,
  title,
  icon,
  color,
  fields,
  headerFields,
  onSave,
  objectId,
}: JournalSectionProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Record<string, string>>({});
  const [headerData, setHeaderData] = useState<Record<string, string>>({});
  const [dbHeaderId, setDbHeaderId] = useState<number | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerSaveTimer, setHeaderSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const loadFromDb = useCallback(async () => {
    setIsLoading(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const [entriesRes, headersRes] = await Promise.all([
        fetch(`${API_URL}?table=journal_entries${objFilter}`),
        fetch(`${API_URL}?table=journal_headers${objFilter}`),
      ]);
      const allEntries = await entriesRes.json();
      const allHeaders = await headersRes.json();

      const sectionEntries = allEntries
        .filter((e: Record<string, string>) => e.section_id === sectionId)
        .map((e: Record<string, string | number | Record<string, string>>) => ({
          id: e.id as number,
          entry_data: typeof e.entry_data === 'string' ? JSON.parse(e.entry_data) : e.entry_data,
          created_at: e.created_at as string,
        }));
      setEntries(sectionEntries);

      const sectionHeader = allHeaders.find((h: Record<string, string>) => h.section_id === sectionId);
      if (sectionHeader) {
        setDbHeaderId(sectionHeader.id);
        const hd = typeof sectionHeader.header_data === 'string'
          ? JSON.parse(sectionHeader.header_data)
          : sectionHeader.header_data;
        setHeaderData(hd || {});
      }
    } catch (error) {
      console.error('Error loading journal from DB:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, objectId]);

  useEffect(() => {
    loadFromDb();
  }, [loadFromDb]);

  const handleFieldChange = (key: string, value: string) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const saveHeaderToDb = useCallback(async (data: Record<string, string>) => {
    try {
      const payload: Record<string, unknown> = {
        table: 'journal_headers',
        section_id: sectionId,
        header_data: JSON.stringify(data),
      };
      if (objectId) payload.object_id = objectId;
      if (dbHeaderId) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: dbHeaderId }),
        });
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        setDbHeaderId(result.id);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving header:', error);
    }
  }, [sectionId, dbHeaderId, objectId]);

  const handleHeaderChange = (key: string, value: string) => {
    const updated = { ...headerData, [key]: value };
    setHeaderData(updated);
    if (headerSaveTimer) clearTimeout(headerSaveTimer);
    const timer = setTimeout(() => saveHeaderToDb(updated), 1000);
    setHeaderSaveTimer(timer);
  };

  const handleAddEntry = async () => {
    const hasData = Object.values(newEntry).some(v => v && String(v).trim());
    if (!hasData) return;
    try {
      const entryPayload: Record<string, unknown> = {
        table: 'journal_entries',
        section_id: sectionId,
        entry_data: JSON.stringify(newEntry),
      };
      if (objectId) entryPayload.object_id = objectId;
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryPayload),
      });
      const result = await res.json();
      setEntries(prev => [...prev, {
        id: result.id,
        entry_data: { ...newEntry },
        created_at: new Date().toISOString(),
      }]);
      onSave(newEntry);
      setLastSaved(new Date());
      setNewEntry({});
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await fetch(`${API_URL}?table=journal_entries&id=${id}`, { method: 'DELETE' });
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleExportPDF = async () => {
    const doc = await createPDF('l');
    const pw = 277;
    let y = 15;

    setFontBold(doc);
    doc.setFontSize(14);
    doc.text(title, 10, y);
    y += 7;

    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, 10, y);
    y += 4;
    doc.text(`Всего записей: ${entries.length}`, 10, y);
    y += 4;

    if (headerFields && headerFields.length > 0) {
      headerFields.forEach(hf => {
        doc.text(`${hf.label}: ${headerData[hf.key] || '—'}`, 10, y);
        y += 4;
      });
    }
    y += 4;

    const colCount = fields.length + 1;
    const numW = 10;
    const dataW = Math.floor((pw - numW) / fields.length);
    const widths = [numW, ...fields.map(() => dataW)];

    const addRow = (cells: string[], bold = false) => {
      if (y > 185) { doc.addPage(); y = 15; }
      doc.setFontSize(7);
      if (bold) { setFontBold(doc); } else { setFontNormal(doc); }
      let x = 10;
      let maxH = 5;
      cells.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, widths[i] - 2);
        maxH = Math.max(maxH, ls.length * 3 + 1);
      });
      cells.forEach((c, i) => {
        const ls = doc.splitTextToSize(c, widths[i] - 2);
        ls.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 3));
        doc.rect(x, y - 3, widths[i], maxH);
        x += widths[i];
      });
      y += maxH;
    };

    addRow(['№', ...fields.map(f => f.label)], true);
    entries.forEach((entry, idx) => {
      addRow([String(idx + 1), ...fields.map(f => entry.entry_data[f.key] || '—')]);
    });

    y += 8;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text('Подпись ответственного: _________________ / _________________ /', 10, y);

    doc.save(`журнал-${sectionId}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Загрузка записей...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
            <Icon name={icon as "Home"} className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base leading-tight truncate">{title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">п.54 Правил противопожарного режима в РФ</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Check" size={12} className="text-success" />
              {lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Badge variant="secondary" className="text-xs font-medium">{entries.length} записей</Badge>
          {entries.length > 0 && (
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-lg">
              <Icon name="Download" size={13} />
              PDF
            </Button>
          )}
        </div>
      </div>

      {headerFields && headerFields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50">
          {headerFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium">{field.label}</Label>
              <Input
                type={field.type || 'text'}
                value={headerData[field.key] || ''}
                onChange={(e) => handleHeaderChange(field.key, e.target.value)}
                className="h-9 text-sm rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-2 animate-stagger">
          {entries.map((row, index) => (
            <div
              key={row.id}
              className="group p-3 bg-card border border-border/50 rounded-xl hover:border-primary/20 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-xs font-bold text-primary/60">
                  {index + 1}
                </span>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1.5 min-w-0">
                  {fields.map((field) => (
                    <div key={field.key} className="min-w-0">
                      <p className="text-[11px] text-muted-foreground mb-0.5 truncate">{field.label}</p>
                      <p className="text-sm leading-snug break-words" title={row.entry_data[field.key] || '-'}>{row.entry_data[field.key] || '-'}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 sm:opacity-100 sm:group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 rounded-lg"
                  onClick={() => handleDeleteEntry(row.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && !isFormOpen && (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border bg-muted/20">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Icon name="FileText" size={24} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Записей пока нет</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Нажмите кнопку ниже, чтобы добавить первую запись</p>
        </div>
      )}

      {isFormOpen ? (
        <Card className="border-primary/20 shadow-lg animate-scale-in overflow-hidden">
          <CardHeader className="pb-3 pt-4 px-4 bg-primary/5">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="PlusCircle" size={16} className="text-primary" />
              Новая запись
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium">{field.label}</Label>
                  <Input
                    type={field.type === 'textarea' ? 'text' : (field.type || 'text')}
                    value={newEntry[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder="Введите данные"
                    className="h-9 text-sm rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsFormOpen(false); setNewEntry({}); }}
                className="text-xs rounded-lg"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleAddEntry}
                className="text-xs gap-1.5 rounded-lg shadow-sm"
              >
                <Icon name="Check" size={14} />
                Сохранить
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed gap-2 text-sm h-12 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors"
          onClick={() => setIsFormOpen(true)}
        >
          <Icon name="Plus" size={16} />
          Добавить запись
        </Button>
      )}
    </div>
  );
}