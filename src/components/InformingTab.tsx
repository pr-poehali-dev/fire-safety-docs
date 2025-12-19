import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface LightningFile {
  id: string;
  name: string;
  uploadDate: string;
}

interface LegalAct {
  id: string;
  title: string;
  url: string;
  description: string;
}

interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function InformingTab() {
  const [lightningFiles, setLightningFiles] = useState<LightningFile[]>([
    { id: '1', name: 'Молниезащита_схема_2024.pdf', uploadDate: '15.12.2024' },
    { id: '2', name: 'Расчет_молниеотводов.xlsx', uploadDate: '10.11.2024' },
  ]);

  const [legalActs] = useState<LegalAct[]>([
    {
      id: '1',
      title: 'Федеральный закон № 123-ФЗ',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_78699/',
      description: 'Технический регламент о требованиях пожарной безопасности',
    },
    {
      id: '2',
      title: 'Постановление Правительства РФ № 1479',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_329181/',
      description: 'Об утверждении Правил противопожарного режима в РФ',
    },
    {
      id: '3',
      title: 'СП 5.13130.2009',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_92664/',
      description: 'Системы противопожарной защиты. Установки пожарной сигнализации',
    },
    {
      id: '4',
      title: 'СП 10.13130.2020',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_377002/',
      description: 'Системы противопожарной защиты. Внутренний противопожарный водопровод',
    },
  ]);

  const [bestPractices] = useState<BestPractice[]>([
    {
      id: '1',
      title: 'Организация эвакуации при пожаре',
      description:
        'Проведение регулярных учебных тревог с засечкой времени эвакуации. Назначение ответственных за эвакуацию на каждом этаже.',
      category: 'Эвакуация',
    },
    {
      id: '2',
      title: 'Техническое обслуживание систем',
      description:
        'Заключение договоров на ТО с сертифицированными организациями. Ведение журнала обслуживания с фотофиксацией.',
      category: 'Обслуживание',
    },
    {
      id: '3',
      title: 'Обучение персонала',
      description:
        'Проведение инструктажей не реже 1 раза в полгода. Использование интерактивных материалов и практических занятий.',
      category: 'Обучение',
    },
    {
      id: '4',
      title: 'Контроль пожарной нагрузки',
      description:
        'Регулярная проверка складских помещений на соблюдение норм складирования. Контроль за использованием горючих материалов.',
      category: 'Контроль',
    },
    {
      id: '5',
      title: 'Интеграция систем безопасности',
      description:
        'Объединение пожарной сигнализации с системой видеонаблюдения и СКУД для быстрого реагирования.',
      category: 'Технологии',
    },
    {
      id: '6',
      title: 'Работа с подрядчиками',
      description:
        'Проверка допусков и сертификатов до начала работ. Контроль соблюдения противопожарного режима подрядными организациями.',
      category: 'Подрядчики',
    },
  ]);

  const [newActTitle, setNewActTitle] = useState('');
  const [newActUrl, setNewActUrl] = useState('');
  const [newActDescription, setNewActDescription] = useState('');

  const handleLightningFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: LightningFile[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        uploadDate: new Date().toLocaleDateString('ru-RU'),
      }));
      setLightningFiles([...lightningFiles, ...newFiles]);
    }
  };

  const handleDeleteFile = (id: string) => {
    setLightningFiles(lightningFiles.filter((file) => file.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Эвакуация': 'bg-red-500',
      'Обслуживание': 'bg-blue-500',
      'Обучение': 'bg-green-500',
      'Контроль': 'bg-yellow-500',
      'Технологии': 'bg-purple-500',
      'Подрядчики': 'bg-orange-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Zap" size={24} className="text-yellow-600" />
            Молниезащита
          </CardTitle>
          <CardDescription>Документация по системам молниезащиты объекта</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lightning-upload" className="mb-2 block">
              Загрузить файлы
            </Label>
            <label htmlFor="lightning-upload">
              <Button variant="outline" className="w-full" asChild>
                <span className="flex items-center gap-2 cursor-pointer">
                  <Icon name="Upload" size={16} />
                  Выбрать файлы
                </span>
              </Button>
              <input
                id="lightning-upload"
                type="file"
                multiple
                className="hidden"
                onChange={handleLightningFileUpload}
              />
            </label>
          </div>

          {lightningFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Загруженные файлы:</p>
              {lightningFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Icon name="FileText" size={20} className="text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Загружено: {file.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
                      <Icon name="Trash2" size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Scale" size={24} className="text-blue-600" />
            Нормативно-правовые акты
          </CardTitle>
          <CardDescription>Ссылки на действующие НПА в области пожарной безопасности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {legalActs.map((act) => (
              <div
                key={act.id}
                className="p-4 bg-white dark:bg-slate-950 rounded-lg border hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">{act.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{act.description}</p>
                    <a
                      href={act.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Icon name="ExternalLink" size={14} />
                      Открыть документ
                    </a>
                  </div>
                  <Icon name="BookOpen" size={24} className="text-blue-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Добавить новую ссылку на НПА:</p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="act-title">Название документа</Label>
                <Input
                  id="act-title"
                  placeholder="Например: Федеральный закон №..."
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="act-url">URL-ссылка</Label>
                <Input
                  id="act-url"
                  placeholder="https://..."
                  value={newActUrl}
                  onChange={(e) => setNewActUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="act-description">Описание</Label>
                <Input
                  id="act-description"
                  placeholder="Краткое описание документа"
                  value={newActDescription}
                  onChange={(e) => setNewActDescription(e.target.value)}
                />
              </div>
              <Button className="w-full">
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить ссылку
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={24} className="text-green-600" />
            Сборник лучших практик
          </CardTitle>
          <CardDescription>Проверенные методы и рекомендации по обеспечению пожарной безопасности</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {bestPractices.map((practice) => (
              <div
                key={practice.id}
                className="p-4 bg-white dark:bg-slate-950 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getCategoryColor(practice.category)}`}>
                    {practice.category}
                  </div>
                </div>
                <h4 className="font-semibold mb-2 text-green-700 dark:text-green-400">{practice.title}</h4>
                <p className="text-sm text-muted-foreground">{practice.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
