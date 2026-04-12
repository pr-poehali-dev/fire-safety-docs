import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';
const categoryOptions = ['А', 'Б', 'В1', 'В2', 'В3', 'В4', 'Г', 'Д'];

interface RoomCategory {
  id: number | string;
  name: string;
  area: string;
  category: string;
  has_lvzh: boolean;
  has_aps: boolean;
  has_aupt: boolean;
  _isNew?: boolean;
}

interface RoomsCategoriesCardProps {
  objectId?: number;
  readOnly?: boolean;
}

export default function RoomsCategoriesCard({ objectId, readOnly }: RoomsCategoriesCardProps) {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<RoomCategory[]>([]);
  const [isEditingRooms, setIsEditingRooms] = useState(false);
  const [savingRooms, setSavingRooms] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const objFilter = objectId ? `&object_id=${objectId}` : '';
      const res = await fetch(`${API_URL}?table=rooms_categories${objFilter}`);
      if (!res.ok) throw new Error('fetch error');
      const data = await res.json();
      setRooms(data.map((row: Record<string, unknown>) => ({
        id: row.id,
        name: row.name || '',
        area: row.area ? String(row.area) : '',
        category: row.category || '',
        has_lvzh: !!row.has_lvzh,
        has_aps: !!row.has_aps,
        has_aupt: !!row.has_aupt,
      })));
    } catch (e) {
      console.error('Error loading rooms:', e);
    } finally {
      setLoadingRooms(false);
    }
  }, [objectId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const addRoom = () => {
    const tempId = `new_${Date.now()}`;
    setRooms(prev => [...prev, {
      id: tempId,
      name: '',
      area: '',
      category: '',
      has_lvzh: false,
      has_aps: false,
      has_aupt: false,
      _isNew: true,
    }]);
    if (!isEditingRooms) setIsEditingRooms(true);
  };

  const updateRoom = (id: number | string, field: string, value: string | boolean) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRoom = async (id: number | string) => {
    const room = rooms.find(r => r.id === id);
    if (room && !room._isNew) {
      try {
        await fetch(`${API_URL}?table=rooms_categories&id=${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Error deleting room:', e);
      }
    }
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const saveRooms = async () => {
    setSavingRooms(true);
    try {
      for (const room of rooms) {
        const payload: Record<string, unknown> = {
          table: 'rooms_categories',
          name: room.name,
          area: room.area ? parseFloat(room.area) : null,
          category: room.category || null,
          has_lvzh: room.has_lvzh,
          has_aps: room.has_aps,
          has_aupt: room.has_aupt,
        };
        if (objectId) payload.object_id = objectId;

        if (room._isNew) {
          await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, id: room.id }),
          });
        }
      }
      toast({ title: 'Сохранено', description: 'Перечень помещений обновлён' });
      setIsEditingRooms(false);
      fetchRooms();
    } catch (e) {
      console.error('Error saving rooms:', e);
      toast({ title: 'Ошибка', description: 'Не удалось сохранить помещения', variant: 'destructive' });
    } finally {
      setSavingRooms(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="LayoutList" size={24} className="text-amber-600" />
              Помещения по категориям взрывопожарной и пожарной опасности
            </CardTitle>
            <CardDescription>Перечень помещений объекта с указанием категорий</CardDescription>
          </div>
          {!readOnly && (
            <div className="flex gap-2">
              {isEditingRooms ? (
                <>
                  <Button onClick={saveRooms} disabled={savingRooms} className="gap-2">
                    <Icon name={savingRooms ? 'Loader2' : 'Save'} size={16} className={savingRooms ? 'animate-spin' : ''} />
                    {savingRooms ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button onClick={() => { setIsEditingRooms(false); fetchRooms(); }} variant="outline" className="gap-2">
                    <Icon name="X" size={16} />
                    Отмена
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditingRooms(true)} variant="outline" className="gap-2">
                  <Icon name="Edit" size={16} />
                  Редактировать
                </Button>
              )}
              <Button onClick={addRoom} variant="outline" className="gap-2">
                <Icon name="Plus" size={16} />
                Добавить
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loadingRooms ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Icon name="Loader2" size={20} className="animate-spin" />
            <span className="text-sm">Загрузка помещений...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Building" size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Помещения не добавлены</p>
            <p className="text-xs mt-1">Нажмите «Добавить» для внесения помещений</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Наименование помещения</th>
                  <th className="text-left p-3 font-medium">Площадь, м²</th>
                  <th className="text-left p-3 font-medium">Категория</th>
                  <th className="text-center p-3 font-medium">ЛВЖ / ГЖ</th>
                  <th className="text-center p-3 font-medium">АПС</th>
                  <th className="text-center p-3 font-medium">АУПТ</th>
                  {isEditingRooms && <th className="p-3 w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b hover:bg-muted/30">
                    <td className="p-3">
                      {isEditingRooms ? (
                        <Input value={room.name} onChange={(e) => updateRoom(room.id, 'name', e.target.value)} placeholder="Название помещения" className="h-9 text-sm" />
                      ) : (
                        <span>{room.name || '—'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditingRooms ? (
                        <Input type="number" value={room.area} onChange={(e) => updateRoom(room.id, 'area', e.target.value)} placeholder="0" className="h-9 text-sm w-24" />
                      ) : (
                        <span>{room.area ? `${room.area} м²` : '—'}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isEditingRooms ? (
                        <Select value={room.category} onValueChange={(v) => updateRoom(room.id, 'category', v)}>
                          <SelectTrigger className="h-9 text-sm w-24">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryOptions.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        room.category ? (
                          <Badge variant="outline" className={
                            room.category === 'А' || room.category === 'Б' ? 'border-red-300 text-red-700 bg-red-50' :
                            room.category.startsWith('В') ? 'border-yellow-300 text-yellow-700 bg-yellow-50' :
                            'border-green-300 text-green-700 bg-green-50'
                          }>{room.category}</Badge>
                        ) : '—'
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditingRooms ? (
                        <button onClick={() => updateRoom(room.id, 'has_lvzh', !room.has_lvzh)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_lvzh ? 'bg-red-100 border-red-400' : 'bg-white border-gray-300'}`}>
                          {room.has_lvzh && <Icon name="Check" size={16} className="text-red-600" />}
                        </button>
                      ) : (
                        room.has_lvzh ? <Badge className="bg-red-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditingRooms ? (
                        <button onClick={() => updateRoom(room.id, 'has_aps', !room.has_aps)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_aps ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300'}`}>
                          {room.has_aps && <Icon name="Check" size={16} className="text-green-600" />}
                        </button>
                      ) : (
                        room.has_aps ? <Badge className="bg-green-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isEditingRooms ? (
                        <button onClick={() => updateRoom(room.id, 'has_aupt', !room.has_aupt)} className={`w-8 h-8 rounded-md border-2 flex items-center justify-center transition-colors mx-auto ${room.has_aupt ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300'}`}>
                          {room.has_aupt && <Icon name="Check" size={16} className="text-blue-600" />}
                        </button>
                      ) : (
                        room.has_aupt ? <Badge className="bg-blue-500">Да</Badge> : <span className="text-muted-foreground">Нет</span>
                      )}
                    </td>
                    {isEditingRooms && (
                      <td className="p-3">
                        <Button variant="ghost" size="sm" onClick={() => removeRoom(room.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground px-3">
              <span>Всего помещений: {rooms.length}</span>
              <span>
                Категории А/Б: {rooms.filter(r => r.category === 'А' || r.category === 'Б').length} |
                В: {rooms.filter(r => r.category.startsWith('В')).length} |
                Г/Д: {rooms.filter(r => r.category === 'Г' || r.category === 'Д').length}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
