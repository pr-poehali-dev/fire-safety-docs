import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

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
}

export default function DeclarationSection({ objectData }: DeclarationProps) {
  const [declarationData, setDeclarationData] = useState({
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

  const handleInputChange = (field: string, value: string) => {
    setDeclarationData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateDeclaration = () => {
    alert('Декларация сформирована! (функция в разработке)');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="FileCheck" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Декларация пожарной безопасности</CardTitle>
            <CardDescription>Формирование декларации в соответствии с требованиями</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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

            <div className="grid md:grid-cols-2 gap-4">
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

            <div className="grid md:grid-cols-2 gap-4">
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
              <div className="grid md:grid-cols-2 gap-4">
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
                  <Label htmlFor="categoryOutdoor">
                    Категория наружных установок по пожарной опасности, категория зданий
                  </Label>
                  <Input
                    id="categoryOutdoor"
                    value={declarationData.categoryOutdoor}
                    onChange={(e) => handleInputChange('categoryOutdoor', e.target.value)}
                    placeholder="А, Б, В, Г, Д"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protectionSystems">
                  Перечень и тип систем противопожарной защиты
                </Label>
                <Textarea
                  id="protectionSystems"
                  value={declarationData.protectionSystems}
                  onChange={(e) => handleInputChange('protectionSystems', e.target.value)}
                  placeholder="Системы: противодымной защиты, пожарной сигнализации, пожаротушения, оповещения и управления эвакуацией, внутренний и наружный противопожарные водопроводы"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleGenerateDeclaration}>
          <Icon name="FileDown" size={18} className="mr-2" />
          Сформировать декларацию ПБ
        </Button>
      </CardContent>
    </Card>
  );
}
