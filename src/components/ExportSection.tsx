import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

interface ExportSection {
  id: string;
  name: string;
  table: string;
  icon: string;
}

const exportSections: ExportSection[] = [
  { id: 'characteristics', name: 'Характеристики объекта', table: 'object_characteristics', icon: 'Building' },
  { id: 'checklist', name: 'Чек-лист', table: 'checklist_items', icon: 'CheckSquare' },
  { id: 'drills', name: 'Тренировки по эвакуации', table: 'drills', icon: 'Users' },
  { id: 'audits', name: 'Проверки (аудиты)', table: 'audits', icon: 'Search' },
  { id: 'calculations', name: 'Расчеты пожарной опасности', table: 'fire_hazard_calculations', icon: 'Calculator' },
  { id: 'insurance', name: 'Страхование', table: 'insurance_policies', icon: 'Shield' },
  { id: 'executive_docs', name: 'Исполнительная документация', table: 'executive_documents', icon: 'FolderOpen' },
];

export default function ExportSection() {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSections.length === exportSections.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(exportSections.map((s) => s.id));
    }
  };

  const convertToCSV = (data: any[], headers: string[]): string => {
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const exportToExcel = async () => {
    if (selectedSections.length === 0) {
      alert('Пожалуйста, выберите хотя бы один раздел для экспорта');
      return;
    }

    setExporting(true);

    try {
      let allData = '';

      for (const sectionId of selectedSections) {
        const section = exportSections.find((s) => s.id === sectionId);
        if (!section) continue;

        const response = await fetch(`${API_URL}?table=${section.table}`);
        const data = await response.json();

        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          const csv = convertToCSV(data, headers);
          allData += `\n\n${section.name}\n${csv}`;
        }
      }

      const blob = new Blob(['\uFEFF' + allData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `fire_safety_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Данные успешно экспортированы в CSV (можно открыть в Excel)');
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-green-500 flex items-center justify-center">
            <Icon name="Download" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Экспорт данных в Excel</CardTitle>
            <CardDescription>Выгрузка данных в формате CSV для работы в Excel</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Выберите разделы для экспорта</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedSections.length === exportSections.length ? 'Снять все' : 'Выбрать все'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center space-x-3 p-3 rounded border border-border hover:bg-muted/50 transition cursor-pointer"
                onClick={() => handleToggleSection(section.id)}
              >
                <Checkbox
                  id={section.id}
                  checked={selectedSections.includes(section.id)}
                  onCheckedChange={() => handleToggleSection(section.id)}
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    <Icon name={section.icon as any} className="text-primary" size={16} />
                  </div>
                  <Label htmlFor={section.id} className="cursor-pointer flex-1 font-medium">
                    {section.name}
                  </Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedSections.length > 0 && (
          <Card className="border-2 border-green-500/20 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold mb-1">Готово к экспорту</p>
                  <p className="text-sm text-muted-foreground">
                    Выбрано разделов: <Badge variant="outline">{selectedSections.length}</Badge>
                  </p>
                </div>
                <Button onClick={exportToExcel} disabled={exporting} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Icon name="FileDown" size={18} className="mr-2" />
                  {exporting ? 'Экспортируем...' : 'Экспортировать в Excel'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Info" size={18} />
              Информация об экспорте
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Данные экспортируются в формате CSV с кодировкой UTF-8</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Файл можно открыть в Microsoft Excel, Google Sheets, LibreOffice</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Экспортируются только заполненные разделы</span>
            </div>
            <div className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 shrink-0" />
              <span>Данные выгружаются из базы данных в реальном времени</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Icon name="Lightbulb" size={18} className="text-blue-600" />
              Как открыть CSV в Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Откройте Microsoft Excel</p>
            <p>2. Файл → Открыть → выберите скачанный CSV файл</p>
            <p>3. Если кириллица отображается неправильно, используйте "Импорт данных" с кодировкой UTF-8</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
