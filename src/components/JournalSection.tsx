import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

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
      const [entriesRes, headersRes] = await Promise.all([
        fetch(`${API_URL}?table=journal_entries`),
        fetch(`${API_URL}?table=journal_headers`),
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
  }, [sectionId]);

  useEffect(() => {
    loadFromDb();
  }, [loadFromDb]);

  const handleFieldChange = (key: string, value: string) => {
    setNewEntry((prev) => ({ ...prev, [key]: value }));
  };

  const saveHeaderToDb = useCallback(async (data: Record<string, string>) => {
    try {
      const payload = {
        table: 'journal_headers',
        section_id: sectionId,
        header_data: JSON.stringify(data),
      };
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
  }, [sectionId, dbHeaderId]);

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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'journal_entries',
          section_id: sectionId,
          entry_data: JSON.stringify(newEntry),
        }),
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-md`}>
            <Icon name={icon as "Home"} className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">п.54 Правил противопожарного режима в РФ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Check" size={12} className="text-green-500" />
              {lastSaved.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Badge variant="secondary" className="text-xs">{entries.length} записей</Badge>
        </div>
      </div>

      {headerFields && headerFields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 p-4 bg-gradient-to-r from-blue-50/80 to-transparent rounded-xl border border-blue-100">
          {headerFields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
              <Input
                type={field.type || 'text'}
                value={headerData[field.key] || ''}
                onChange={(e) => handleHeaderChange(field.key, e.target.value)}
                className="h-9 text-sm bg-white border-blue-200/60 focus:border-blue-400 rounded-lg"
              />
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((row, index) => (
            <div
              key={row.id}
              className="group p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                  {index + 1}
                </span>
                <div className="flex-1 grid gap-x-4 gap-y-1" style={{ gridTemplateColumns: `repeat(${Math.min(fields.length, 3)}, 1fr)` }}>
                  {fields.map((field) => (
                    <div key={field.key} className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5 truncate">{field.label}</p>
                      <p className="text-sm leading-snug truncate" title={row.entry_data[field.key] || '-'}>{row.entry_data[field.key] || '-'}</p>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
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
        <div className="text-center py-10 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <Icon name="FileText" size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-muted-foreground">Записей пока нет</p>
          <p className="text-xs text-muted-foreground mt-1">Нажмите кнопку ниже, чтобы добавить первую запись</p>
        </div>
      )}

      {isFormOpen ? (
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="PlusCircle" size={16} className="text-blue-500" />
              Новая запись
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">{field.label}</Label>
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
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsFormOpen(false); setNewEntry({}); }}
                className="text-xs"
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleAddEntry}
                className="text-xs gap-1.5"
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
          className="w-full border-dashed gap-2 text-sm"
          onClick={() => setIsFormOpen(true)}
        >
          <Icon name="Plus" size={16} />
          Добавить запись
        </Button>
      )}
    </div>
  );
}
