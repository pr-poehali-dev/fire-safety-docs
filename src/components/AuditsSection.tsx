import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Audit {
  date: string;
  inspector: string;
  violations: string;
  deadline: string;
  completed: string;
  responsible: string;
}

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

export default function AuditsSection() {
  const [audits, setAudits] = useState<Audit[]>([]);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const response = await fetch(`${API_URL}?table=audits`);
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
        const response = await fetch(API_URL, {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
            <Icon name="Search" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Проверки (аудиты) объекта</CardTitle>
            <CardDescription>Учет проверок и устранение выявленных нарушений</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить проверку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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