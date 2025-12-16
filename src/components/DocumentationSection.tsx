import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const documentSubsections = [
  { id: 'order', icon: 'FileText', title: 'Приказ о назначении ответственного за ПБ' },
  { id: 'training', icon: 'GraduationCap', title: 'Обучение мерам пожарной безопасности' },
  { id: 'instructions', icon: 'BookOpen', title: 'Инструкция о мерах пожарной безопасности' },
  { id: 'intro_program', icon: 'Presentation', title: 'Программа вводного противопожарного инструктажа' },
  { id: 'primary_program', icon: 'ClipboardCheck', title: 'Программа первичного противопожарного инструктажа на рабочем месте' },
  { id: 'responsibilities', icon: 'Users', title: 'Обязанности работников' },
  { id: 'journal', icon: 'Book', title: 'Журнал инструктажей' },
];

export default function DocumentationSection() {
  const [activeTab, setActiveTab] = useState('order');
  const [files, setFiles] = useState<Record<string, File[]>>({});

  const handleFileUpload = (subsectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setFiles((prev) => ({
      ...prev,
      [subsectionId]: [...(prev[subsectionId] || []), ...uploadedFiles],
    }));
  };

  const handleFileRemove = (subsectionId: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [subsectionId]: prev[subsectionId].filter((_, i) => i !== index),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="FileText" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Документация</CardTitle>
            <CardDescription>Управление документами по пожарной безопасности</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-2">
            {documentSubsections.map((subsection) => (
              <TabsTrigger
                key={subsection.id}
                value={subsection.id}
                className="text-xs px-3 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name={subsection.icon as any} size={14} className="mr-2" />
                {subsection.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentSubsections.map((subsection) => (
            <TabsContent key={subsection.id} value={subsection.id} className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded border border-border">
                  <div className="flex items-center gap-3">
                    <Icon name={subsection.icon as any} size={20} className="text-muted-foreground" />
                    <div>
                      <p className="font-medium">{subsection.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Загружено документов: {files[subsection.id]?.length || 0}
                      </p>
                    </div>
                  </div>
                  <label htmlFor={`file-${subsection.id}`}>
                    <Button type="button" size="sm" onClick={() => document.getElementById(`file-${subsection.id}`)?.click()}>
                      <Icon name="Upload" size={16} className="mr-2" />
                      Загрузить документ
                    </Button>
                    <input
                      id={`file-${subsection.id}`}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(subsection.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2">
                  {files[subsection.id]?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card rounded border border-border hover:bg-muted/20 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="FileText" size={18} className="text-primary" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const url = URL.createObjectURL(file);
                            window.open(url, '_blank');
                          }}
                        >
                          <Icon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileRemove(subsection.id, index)}
                        >
                          <Icon name="Trash2" size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {(!files[subsection.id] || files[subsection.id].length === 0) && (
                    <div className="text-center py-8">
                      <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Документы не загружены</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
