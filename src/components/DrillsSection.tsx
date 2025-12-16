import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Drill {
  date: string;
  order: string;
  purpose: string;
  leader: string;
  participants: string;
  documents: File[];
}

export default function DrillsSection() {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [newDrill, setNewDrill] = useState<Drill>({
    date: '',
    order: '',
    purpose: '',
    leader: '',
    participants: '',
    documents: [],
  });

  const handleInputChange = (field: keyof Drill, value: string) => {
    setNewDrill((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewDrill((prev) => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const handleAddDrill = () => {
    if (newDrill.date && newDrill.purpose) {
      setDrills((prev) => [...prev, newDrill]);
      setNewDrill({
        date: '',
        order: '',
        purpose: '',
        leader: '',
        participants: '',
        documents: [],
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
            <Icon name="Users" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Тренировки по эвакуации</CardTitle>
            <CardDescription>Учет проведения тренировок и учений по эвакуации</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить новую тренировку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Дата проведения</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDrill.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Номер приказа</Label>
                <Input
                  id="order"
                  value={newDrill.order}
                  onChange={(e) => handleInputChange('order', e.target.value)}
                  placeholder="Приказ №..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Цель проведения тренировки</Label>
              <Textarea
                id="purpose"
                value={newDrill.purpose}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder="Опишите цели и задачи тренировки"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leader">Руководитель тренировки по эвакуации</Label>
              <Input
                id="leader"
                value={newDrill.leader}
                onChange={(e) => handleInputChange('leader', e.target.value)}
                placeholder="ФИО, должность"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Состав участников объектовой тренировки</Label>
              <Textarea
                id="participants"
                value={newDrill.participants}
                onChange={(e) => handleInputChange('participants', e.target.value)}
                placeholder="Перечислите участников тренировки"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Документы</Label>
              <div className="flex items-center gap-2">
                <label htmlFor="drill-docs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('drill-docs')?.click()}
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    Прикрепить документы ({newDrill.documents.length})
                  </Button>
                  <input
                    id="drill-docs"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {newDrill.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  {newDrill.documents.map((file, index) => (
                    <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Icon name="Paperclip" size={12} />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleAddDrill}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить тренировку
            </Button>
          </CardContent>
        </Card>

        {drills.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Приказ</TableHead>
                  <TableHead>Цель</TableHead>
                  <TableHead>Руководитель</TableHead>
                  <TableHead>Участники</TableHead>
                  <TableHead className="w-24">Документы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drills.map((drill, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(drill.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-sm">{drill.order}</TableCell>
                    <TableCell className="text-sm max-w-md">
                      <div className="line-clamp-2">{drill.purpose}</div>
                    </TableCell>
                    <TableCell className="text-sm">{drill.leader}</TableCell>
                    <TableCell className="text-sm max-w-md">
                      <div className="line-clamp-2">{drill.participants}</div>
                    </TableCell>
                    <TableCell>
                      {drill.documents.length > 0 && (
                        <Button variant="ghost" size="sm">
                          <Icon name="Paperclip" size={14} className="mr-1" />
                          {drill.documents.length}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {drills.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Тренировки не добавлены</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
