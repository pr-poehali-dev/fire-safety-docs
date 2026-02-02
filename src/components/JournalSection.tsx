import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface JournalSectionProps {
  sectionId: string;
  title: string;
  icon: string;
  color: string;
  fields: Array<{ key: string; label: string; type?: string; span?: number }>;
  headerFields?: Array<{ key: string; label: string; type?: string }>;
  onSave: (data: any) => void;
  data?: any[];
}

export default function JournalSection({
  sectionId,
  title,
  icon,
  color,
  fields,
  headerFields,
  onSave,
  data = [],
}: JournalSectionProps) {
  const storageKey = `journal_${sectionId}`;
  const [entries, setEntries] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState<any>({});
  const [headerData, setHeaderData] = useState<any>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setEntries(parsed.entries || []);
        setHeaderData(parsed.headerData || {});
      } catch (e) {
        console.error('Error loading journal data:', e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (entries.length > 0 || Object.keys(headerData).length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({ entries, headerData, lastModified: new Date().toISOString() }));
      setLastSaved(new Date());
    }
  }, [entries, headerData, storageKey]);

  const handleFieldChange = (key: string, value: string) => {
    setNewEntry((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleHeaderChange = (key: string, value: string) => {
    setHeaderData((prev: any) => ({ ...prev, [key]: value }));
  };

  const logActivity = (action: string, details?: string) => {
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push({
      id: Date.now().toString(),
      action,
      section: title,
      timestamp: new Date().toISOString(),
      details,
    });
    localStorage.setItem('activity_logs', JSON.stringify(logs.slice(-100)));
  };

  const handleAddEntry = () => {
    const entry = { ...newEntry, id: Date.now(), createdAt: new Date().toISOString() };
    setEntries(prev => [...prev, entry]);
    onSave(entry);
    logActivity('Добавлена запись', Object.values(newEntry).slice(0, 2).join(', '));
    setNewEntry({});
  };

  const handleDeleteEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    logActivity('Удалена запись', `ID: ${id}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded ${color} flex items-center justify-center`}>
            <Icon name={icon as any} className="text-white" size={24} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-xs mt-1">
              (п.54 Правил противопожарного режима в РФ)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {headerFields && headerFields.length > 0 && (
          <div className="mb-6 p-4 bg-muted/30 rounded border border-border">
            <div className="grid gap-4 md:grid-cols-2">
              {headerFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </Label>
                  <Input
                    type={field.type || 'text'}
                    value={headerData[field.key] || ''}
                    onChange={(e) => handleHeaderChange(field.key, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">№</TableHead>
                {fields.map((field) => (
                  <TableHead key={field.key} className="min-w-[200px]">
                    {field.label}
                  </TableHead>
                ))}
                <TableHead className="w-24">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                  {fields.map((field) => (
                    <TableCell key={field.key} className="text-sm">
                      {row[field.key] || '-'}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(row.id)}>
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/20">
                <TableCell className="font-mono text-xs font-bold">+</TableCell>
                {fields.map((field) => (
                  <TableCell key={field.key}>
                    {field.type === 'textarea' ? (
                      <Textarea
                        value={newEntry[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder="Введите данные"
                        rows={2}
                        className="font-mono text-sm"
                      />
                    ) : (
                      <Input
                        type={field.type || 'text'}
                        value={newEntry[field.key] || ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder="Введите данные"
                        className="font-mono text-sm"
                      />
                    )}
                  </TableCell>
                ))}
                <TableCell>
                  <Button onClick={handleAddEntry} size="sm" variant="default">
                    <Icon name="Plus" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>Всего записей: {entries.length}</span>
          {lastSaved && (
            <span className="flex items-center gap-1">
              <Icon name="Check" size={12} className="text-green-600" />
              Сохранено: {lastSaved.toLocaleTimeString('ru-RU')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}