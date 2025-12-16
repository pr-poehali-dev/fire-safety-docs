import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ExecutiveDoc {
  name: string;
  date: string;
  file?: File;
}

export default function ExecutiveDocsSection() {
  const [docs, setDocs] = useState<ExecutiveDoc[]>([]);
  const [newDoc, setNewDoc] = useState<ExecutiveDoc>({ name: '', date: '', file: undefined });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewDoc((prev) => ({ ...prev, file }));
    }
  };

  const handleAddDoc = () => {
    if (newDoc.name && newDoc.date) {
      setDocs((prev) => [...prev, newDoc]);
      setNewDoc({ name: '', date: '', file: undefined });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
            <Icon name="FolderOpen" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Исполнительная документация</CardTitle>
            <CardDescription>Хранение исполнительной документации по объекту</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить документ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Наименование документа</Label>
                <Input
                  id="doc-name"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название документа"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-date">Дата</Label>
                <Input
                  id="doc-date"
                  type="date"
                  value={newDoc.date}
                  onChange={(e) => setNewDoc((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Файл документа</Label>
              <div className="flex items-center gap-2">
                <label htmlFor="doc-file" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('doc-file')?.click()}
                  >
                    <Icon name="Upload" size={16} className="mr-2" />
                    {newDoc.file ? newDoc.file.name : 'Выбрать файл'}
                  </Button>
                  <input
                    id="doc-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <Button className="w-full" onClick={handleAddDoc}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить документ
            </Button>
          </CardContent>
        </Card>

        {docs.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="w-32">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((doc, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{doc.name}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(doc.date).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {doc.file && (
                          <Button variant="ghost" size="sm">
                            <Icon name="Download" size={14} />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Icon name="Trash2" size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {docs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="FolderOpen" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Документы не добавлены</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
