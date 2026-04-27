import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { authedFetch, DB_API } from '@/lib/api';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';

interface ObjectData {
  name: string;
  functionalClass: string;
  commissioningDate: string;
  address: string;
  area: string;
  height: string;
  floors: string;
  workplaces: string;
  workingHours: string;
  protectionSystems: string;
}

interface DeclarationProps {
  objectData: ObjectData;
  objectId?: number;
}

interface DeclarationData {
  owner: string;
  ogrn: string;
  inn: string;
  location: string;
  postalEmail: string;
  phone: string;
  commissioning: string;
  fireResistance: string;
  constructionClass: string;
  functionalClass: string;
  buildingHeight: string;
  floorArea: string;
  buildingVolume: string;
  floors: string;
  categoryOutdoor: string;
  protectionSystems: string;
}

const fieldToColumn: Record<string, string> = {
  owner: 'owner',
  ogrn: 'ogrn',
  inn: 'inn',
  location: 'location',
  postalEmail: 'postal_email',
  phone: 'phone',
  commissioning: 'commissioning',
  fireResistance: 'fire_resistance',
  constructionClass: 'construction_class',
  functionalClass: 'functional_class',
  buildingHeight: 'building_height',
  floorArea: 'floor_area',
  buildingVolume: 'building_volume',
  floors: 'floors',
  categoryOutdoor: 'category_outdoor',
  protectionSystems: 'protection_systems',
};

const columnToField: Record<string, string> = Object.fromEntries(
  Object.entries(fieldToColumn).map(([k, v]) => [v, k])
);

export default function DeclarationSection({ objectData, objectId }: DeclarationProps) {
  const [dbId, setDbId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [declarationData, setDeclarationData] = useState<DeclarationData>({
    owner: '',
    ogrn: '',
    inn: '',
    location: objectData.address || '',
    postalEmail: '',
    phone: '',
    commissioning: objectData.commissioningDate || '',
    fireResistance: '',
    constructionClass: '',
    functionalClass: objectData.functionalClass || '',
    buildingHeight: objectData.height || '',
    floorArea: objectData.area || '',
    buildingVolume: '',
    floors: objectData.floors || '',
    categoryOutdoor: '',
    protectionSystems: objectData.protectionSystems || '',
  });

  const loadFromDb = useCallback(async () => {
    setIsLoading(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const res = await authedFetch(`${DB_API}?table=declarations${objFilter}`);
      const rows = await res.json();
      if (rows.length > 0) {
        const row = rows[0] as Record<string, string | number>;
        setDbId(row.id as number);
        const loaded: Record<string, string> = {};
        for (const [col, val] of Object.entries(row)) {
          const fieldName = columnToField[col];
          if (fieldName && val) {
            loaded[fieldName] = String(val);
          }
        }
        setDeclarationData(prev => ({ ...prev, ...loaded }));
      }
    } catch (error) {
      console.error('Error loading declaration from DB:', error);
    } finally {
      setIsLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    loadFromDb();
  }, [loadFromDb]);

  const handleInputChange = (field: string, value: string) => {
    setDeclarationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, string | number> = { table: 'declarations' };
      for (const [field, col] of Object.entries(fieldToColumn)) {
        payload[col] = declarationData[field as keyof DeclarationData];
      }
      if (objectId) payload.object_id = objectId;

      if (dbId) {
        payload.id = dbId;
        await authedFetch(DB_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const res = await authedFetch(DB_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        setDbId(result.id);
      }
    } catch (error) {
      console.error('Error saving declaration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDeclaration = async () => {
    await handleSave();
    const doc = await createPDF('p');
    let y = 18;
    const pageWidth = 210;
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    setFontBold(doc);
    doc.setFontSize(15);
    doc.text('ДЕКЛАРАЦИЯ ПОЖАРНОЙ БЕЗОПАСНОСТИ', pageWidth / 2, y, { align: 'center' });
    y += 7;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text(`Сформирована: ${new Date().toLocaleDateString('ru-RU')}`, pageWidth / 2, y, { align: 'center' });
    y += 10;

    const sections: { title: string; rows: [string, string][] }[] = [
      {
        title: 'I. Сведения о собственнике',
        rows: [
          ['Наименование', declarationData.owner || '—'],
          ['ОГРН', declarationData.ogrn || '—'],
          ['ИНН', declarationData.inn || '—'],
          ['Адрес', declarationData.location || '—'],
          ['Email', declarationData.postalEmail || '—'],
          ['Телефон', declarationData.phone || '—'],
        ],
      },
      {
        title: 'II. Характеристика объекта',
        rows: [
          ['Дата ввода в эксплуатацию', declarationData.commissioning || '—'],
          ['Степень огнестойкости', declarationData.fireResistance || '—'],
          ['Класс конструктивной пож. опасности', declarationData.constructionClass || '—'],
          ['Класс функциональной пож. опасности', declarationData.functionalClass || '—'],
          ['Высота здания (м)', declarationData.buildingHeight || '—'],
          ['Площадь этажа (м²)', declarationData.floorArea || '—'],
          ['Строительный объём (м³)', declarationData.buildingVolume || '—'],
          ['Количество этажей', declarationData.floors || '—'],
          ['Категория наружных установок', declarationData.categoryOutdoor || '—'],
        ],
      },
      {
        title: 'III. Системы противопожарной защиты',
        rows: [
          ['Перечень систем', declarationData.protectionSystems || '—'],
        ],
      },
    ];

    sections.forEach((section) => {
      if (y > 260) {
        doc.addPage();
        y = 18;
      }
      setFontBold(doc);
      doc.setFontSize(11);
      doc.text(section.title, margin, y);
      y += 6;
      setFontNormal(doc);
      doc.setFontSize(9);
      section.rows.forEach(([label, value]) => {
        if (y > 275) {
          doc.addPage();
          y = 18;
        }
        const labelLines = doc.splitTextToSize(label + ':', 75);
        const valueLines = doc.splitTextToSize(value, maxWidth - 80);
        const rowHeight = Math.max(labelLines.length, valueLines.length) * 4.5 + 1.5;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y - 3, pageWidth - margin, y - 3);
        doc.text(labelLines, margin + 1, y);
        doc.text(valueLines, margin + 80, y);
        y += rowHeight;
      });
      y += 4;
    });

    if (y > 260) { doc.addPage(); y = 18; }
    y += 8;
    setFontNormal(doc);
    doc.setFontSize(9);
    doc.text('Декларация составлена в соответствии с требованиями ст. 64 ФЗ-123 «Технический', margin, y);
    y += 4;
    doc.text('регламент о требованиях пожарной безопасности».', margin, y);
    y += 12;
    doc.text('Подпись ответственного: _________________ /_________________ /', margin, y);
    y += 7;
    doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, margin, y);

    doc.save(`деклaрация-ПБ-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Загрузка декларации...</span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="FileCheck" className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <CardTitle>Декларация пожарной безопасности</CardTitle>
            <CardDescription>Формирование декларации в соответствии с требованиями</CardDescription>
          </div>
          <Button onClick={handleSave} variant="outline" className="gap-2" disabled={isSaving}>
            {isSaving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
            Сохранить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Сведения о собственнике объекта защиты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner">Собственник объекта защиты</Label>
              <Input
                id="owner"
                value={declarationData.owner}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                placeholder="Наименование организации или ФИО"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ogrn">ОГРН</Label>
                <Input
                  id="ogrn"
                  value={declarationData.ogrn}
                  onChange={(e) => handleInputChange('ogrn', e.target.value)}
                  placeholder="13 цифр"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inn">ИНН</Label>
                <Input
                  id="inn"
                  value={declarationData.inn}
                  onChange={(e) => handleInputChange('inn', e.target.value)}
                  placeholder="10 или 12 цифр"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место нахождения объекта защиты</Label>
              <Input
                id="location"
                value={declarationData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Полный адрес"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalEmail">Почтовый и электронный адрес</Label>
                <Input
                  id="postalEmail"
                  value={declarationData.postalEmail}
                  onChange={(e) => handleInputChange('postalEmail', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Телефон, факс</Label>
                <Input
                  id="phone"
                  value={declarationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissioning">
                Сведения о вводе объекта защиты в эксплуатацию, проведении реконструкции, капитального ремонта
              </Label>
              <Textarea
                id="commissioning"
                value={declarationData.commissioning}
                onChange={(e) => handleInputChange('commissioning', e.target.value)}
                placeholder="Дата ввода, реконструкции"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Характеристика объекта защиты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fireResistance">Степень огнестойкости</Label>
                  <Input
                    id="fireResistance"
                    value={declarationData.fireResistance}
                    onChange={(e) => handleInputChange('fireResistance', e.target.value)}
                    placeholder="I, II, III, IV, V"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constructionClass">Класс конструктивной пожарной опасности</Label>
                  <Input
                    id="constructionClass"
                    value={declarationData.constructionClass}
                    onChange={(e) => handleInputChange('constructionClass', e.target.value)}
                    placeholder="C0, C1, C2, C3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functionalClass">Класс функциональной пожарной опасности</Label>
                  <Input
                    id="functionalClass"
                    value={declarationData.functionalClass}
                    onChange={(e) => handleInputChange('functionalClass', e.target.value)}
                    placeholder="Ф1.1, Ф2.3 и т.д."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingHeight">Высота здания (м)</Label>
                  <Input
                    id="buildingHeight"
                    type="number"
                    value={declarationData.buildingHeight}
                    onChange={(e) => handleInputChange('buildingHeight', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floorArea">Площадь этажа в пределах пожарного отсека здания (м²)</Label>
                  <Input
                    id="floorArea"
                    type="number"
                    value={declarationData.floorArea}
                    onChange={(e) => handleInputChange('floorArea', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buildingVolume">Объем здания (м³)</Label>
                  <Input
                    id="buildingVolume"
                    type="number"
                    value={declarationData.buildingVolume}
                    onChange={(e) => handleInputChange('buildingVolume', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floors">Количество этажей</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={declarationData.floors}
                    onChange={(e) => handleInputChange('floors', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryOutdoor">Категория наружных установок</Label>
                  <Input
                    id="categoryOutdoor"
                    value={declarationData.categoryOutdoor}
                    onChange={(e) => handleInputChange('categoryOutdoor', e.target.value)}
                    placeholder="А, Б, В, Г, Д"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protectionSystems">Перечень систем противопожарной защиты</Label>
                <Textarea
                  id="protectionSystems"
                  value={declarationData.protectionSystems}
                  onChange={(e) => handleInputChange('protectionSystems', e.target.value)}
                  placeholder="Опишите системы защиты"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full gap-2" onClick={handleGenerateDeclaration}>
          <Icon name="FileCheck" size={20} />
          Сформировать декларацию ПБ
        </Button>
      </CardContent>
    </Card>
  );
}