import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { authedFetch, DB_API } from '@/lib/api';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

interface Audit {
  date: string;
  inspector: string;
  violations: string;
  deadline: string;
  completed: string;
  responsible: string;
}

export default function AuditsSection({ objectId }: { objectId?: number }) {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    loadAudits();
  }, [objectId]);

  const loadAudits = async () => {
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const response = await authedFetch(`${DB_API}?table=audits${objFilter}`);
      const data = await response.json();
      const loadedAudits = data.map((item: any) => ({
        date: item.audit_date,
        inspector: item.inspector || '',
        violations: item.violations_count?.toString() || '0',
        deadline: item.deadline || '',
        completed: item.completed_count?.toString() || '0',
        responsible: '',
      }));
      setAudits(loadedAudits);
    } catch (error) {
      console.error('Error loading audits:', error);
    }
  };
  const [newAudit, setNewAudit] = useState<Audit>({
    date: '',
    inspector: '',
    violations: '',
    deadline: '',
    completed: '',
    responsible: '',
  });

  const handleInputChange = (field: keyof Audit, value: string) => {
    setNewAudit((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAudit = async () => {
    if (newAudit.date && newAudit.inspector) {
      try {
        const response = await authedFetch(DB_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'audits',
            audit_date: newAudit.date,
            inspector: newAudit.inspector,
            violations_count: parseInt(newAudit.violations) || 0,
            completed_count: parseInt(newAudit.completed) || 0,
            deadline: newAudit.deadline || null,
            status: 'in_progress',
            ...(objectId ? { object_id: objectId } : {}),
          }),
        });
        
        if (response.ok) {
          setAudits((prev) => [...prev, newAudit]);
          setNewAudit({
            date: '',
            inspector: '',
            violations: '',
            deadline: '',
            completed: '',
            responsible: '',
          });
          alert('Проверка успешно добавлена в базу данных');
          loadAudits();
        }
      } catch (error) {
        console.error('Error saving audit:', error);
        alert('Ошибка при сохранении проверки');
      }
    }
  };

  const handleExportPDF = async () => {
    const doc = await createPDF('l');
    const pageWidth = 297;
    let y = 15;

    setFontBold(doc);
    doc.setFontSize(14);
    doc.text('РЕЕСТР ПРОВЕРОК (АУДИТОВ) ОБЪЕКТА', pageWidth / 2, y, { align: 'center' });
    y += 6;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text(`Всего проверок: ${audits.length}`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    const headers = ['№', 'Дата', 'Кем проведена', 'Нарушений', 'Срок устранения', 'Устранено'];
    const widths = [10, 25, 90, 30, 50, 30];

    const drawRow = (cells: string[], bold = false) => {
      if (y > 185) { doc.addPage(); y = 15; }
      if (bold) setFontBold(doc); else setFontNormal(doc);
      doc.setFontSize(8);
      let x = 10;
      let maxH = 5;
      const wrapped = cells.map((c, i) => {
        const lines = doc.splitTextToSize(c || '—', widths[i] - 2);
        maxH = Math.max(maxH, lines.length * 3.5 + 1);
        return lines;
      });
      wrapped.forEach((lines, i) => {
        doc.rect(x, y - 3.5, widths[i], maxH);
        lines.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 3.5));
        x += widths[i];
      });
      y += maxH;
    };

    drawRow(headers, true);
    audits.forEach((a, i) => {
      drawRow([
        String(i + 1),
        a.date ? new Date(a.date).toLocaleDateString('ru-RU') : '',
        a.inspector,
        a.violations || '0',
        a.deadline ? new Date(a.deadline).toLocaleDateString('ru-RU') : '',
        a.completed || '0',
      ]);
    });

    y += 8;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text('Подпись ответственного: _________________ /_________________ /', 10, y);
    doc.save(`проверки-аудиты-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
              <Icon name="Search" className="text-white" size={24} />
            </div>
            <div>
              <CardTitle>Проверки (аудиты) объекта</CardTitle>
              <CardDescription>Учет проверок и устранение выявленных нарушений</CardDescription>
            </div>
          </div>
          {audits.length > 0 && (
            <Button onClick={handleExportPDF} variant="outline" size="sm" className="gap-1.5 rounded-lg">
              <Icon name="Download" size={14} />
              Экспорт PDF
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить проверку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audit-date">Дата проверки</Label>
                <Input
                  id="audit-date"
                  type="date"
                  value={newAudit.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-inspector">Кем проведена проверка (аудит)</Label>
                <Input
                  id="audit-inspector"
                  value={newAudit.inspector}
                  onChange={(e) => handleInputChange('inspector', e.target.value)}
                  placeholder="Организация, инспектор"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-violations">Количество нарушений</Label>
                <Input
                  id="audit-violations"
                  type="number"
                  value={newAudit.violations}
                  onChange={(e) => handleInputChange('violations', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-deadline">Сроки устранения нарушений</Label>
                <Input
                  id="audit-deadline"
                  type="date"
                  value={newAudit.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-completed">Количество выполненных нарушений</Label>
                <Input
                  id="audit-completed"
                  type="number"
                  value={newAudit.completed}
                  onChange={(e) => handleInputChange('completed', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-responsible">Ответственный за устранение нарушений</Label>
                <Input
                  id="audit-responsible"
                  value={newAudit.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="ФИО, должность"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleAddAudit}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить проверку
            </Button>
          </CardContent>
        </Card>

        {audits.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Инспектор</TableHead>
                  <TableHead>Нарушений</TableHead>
                  <TableHead>Срок устранения</TableHead>
                  <TableHead>Выполнено</TableHead>
                  <TableHead>Ответственный</TableHead>
                  <TableHead className="w-32">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audits.map((audit, index) => {
                  const violationsCount = parseInt(audit.violations) || 0;
                  const completedCount = parseInt(audit.completed) || 0;
                  const percentage = violationsCount > 0 ? (completedCount / violationsCount) * 100 : 0;
                  const isOverdue =
                    audit.deadline && new Date(audit.deadline) < new Date() && completedCount < violationsCount;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(audit.date).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-sm">{audit.inspector}</TableCell>
                      <TableCell className="text-sm text-center">
                        <Badge variant="outline">{audit.violations}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {audit.deadline ? new Date(audit.deadline).toLocaleDateString('ru-RU') : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <Badge variant={percentage === 100 ? 'default' : 'secondary'}>
                          {audit.completed}/{audit.violations}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{audit.responsible}</TableCell>
                      <TableCell>
                        {percentage === 100 ? (
                          <Badge className="bg-green-600">Выполнено</Badge>
                        ) : isOverdue ? (
                          <Badge variant="destructive">Просрочено</Badge>
                        ) : (
                          <Badge variant="secondary">В работе</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {audits.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Проверки не добавлены</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}