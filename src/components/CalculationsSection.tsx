import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RoomCalculation {
  name: string;
  area: string;
  height: string;
  lvzh_gzh: string;
  specific_load: string;
  electrical: string;
}

export default function CalculationsSection() {
  const [rooms, setRooms] = useState<RoomCalculation[]>([]);
  const [newRoom, setNewRoom] = useState<RoomCalculation>({
    name: '',
    area: '',
    height: '',
    lvzh_gzh: '',
    specific_load: '',
    electrical: '',
  });

  const handleInputChange = (field: keyof RoomCalculation, value: string) => {
    setNewRoom((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRoom = () => {
    if (newRoom.name && newRoom.area) {
      setRooms((prev) => [...prev, newRoom]);
      setNewRoom({
        name: '',
        area: '',
        height: '',
        lvzh_gzh: '',
        specific_load: '',
        electrical: '',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-orange-500 flex items-center justify-center">
            <Icon name="Calculator" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Расчеты по категории взрывопожарной и пожарной опасности</CardTitle>
            <CardDescription>Внесение данных для расчета категории помещений</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить помещение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-name">Наименование помещения</Label>
                <Input
                  id="room-name"
                  value={newRoom.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Например: Производственный цех №1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-area">Площадь (м²)</Label>
                <Input
                  id="room-area"
                  type="number"
                  value={newRoom.area}
                  onChange={(e) => handleInputChange('area', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-height">Высота потолка (м)</Label>
                <Input
                  id="room-height"
                  type="number"
                  step="0.1"
                  value={newRoom.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-lvzh">Наличие ЛВЖ и ГЖ</Label>
                <Input
                  id="room-lvzh"
                  value={newRoom.lvzh_gzh}
                  onChange={(e) => handleInputChange('lvzh_gzh', e.target.value)}
                  placeholder="Да/Нет, тип веществ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-load">Удельная нагрузка (кг)</Label>
                <Input
                  id="room-load"
                  value={newRoom.specific_load}
                  onChange={(e) => handleInputChange('specific_load', e.target.value)}
                  placeholder="Вещества и материалы"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="room-electrical">Электроустановки</Label>
                <Input
                  id="room-electrical"
                  value={newRoom.electrical}
                  onChange={(e) => handleInputChange('electrical', e.target.value)}
                  placeholder="Описание электроустановок"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleAddRoom}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить помещение
            </Button>
          </CardContent>
        </Card>

        {rooms.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Площадь (м²)</TableHead>
                  <TableHead>Высота (м)</TableHead>
                  <TableHead>ЛВЖ/ГЖ</TableHead>
                  <TableHead>Удельная нагрузка</TableHead>
                  <TableHead>Электроустановки</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{room.name}</TableCell>
                    <TableCell className="text-sm">{room.area}</TableCell>
                    <TableCell className="text-sm">{room.height}</TableCell>
                    <TableCell className="text-sm">{room.lvzh_gzh || '-'}</TableCell>
                    <TableCell className="text-sm">{room.specific_load || '-'}</TableCell>
                    <TableCell className="text-sm">{room.electrical || '-'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Icon name="Trash2" size={14} className="text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {rooms.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Calculator" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Помещения для расчета не добавлены</p>
            </CardContent>
          </Card>
        )}

        {rooms.length > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon name="TrendingUp" size={18} />
                Выполнить расчет категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                После добавления всех помещений нажмите кнопку для автоматического расчета категорий взрывопожарной и
                пожарной опасности
              </p>
              <Button className="w-full">
                <Icon name="Play" size={16} className="mr-2" />
                Рассчитать категории
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
