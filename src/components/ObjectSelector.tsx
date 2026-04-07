import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth, FireObject } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ObjectSelector() {
  const { user, objects, selectObject, createObject, logout, hasRole } = useAuth();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newObject, setNewObject] = useState({ name: '', address: '' });

  const canCreate = hasRole(['admin', 'responsible']);

  const handleCreate = async () => {
    if (!newObject.name.trim()) {
      toast({ title: 'Введите наименование объекта', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const id = await createObject({ name: newObject.name, address: newObject.address });
    if (id) {
      toast({ title: 'Объект создан' });
      setShowCreate(false);
      setNewObject({ name: '', address: '' });
    } else {
      toast({ title: 'Ошибка создания объекта', variant: 'destructive' });
    }
    setCreating(false);
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const colors: Record<string, string> = {
      admin: 'bg-purple-500',
      responsible: 'bg-blue-500',
      manager: 'bg-green-500',
    };
    return <Badge className={colors[user.role_code] || 'bg-gray-500'}>{user.role_name}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="Flame" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Журнал пожарной безопасности</h1>
              <p className="text-muted-foreground text-sm">Выберите объект для работы</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <div className="flex items-center gap-2 justify-end">
                {getRoleBadge()}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="Building2" size={20} />
            Объекты защиты ({objects.length})
          </h2>
          {canCreate && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Icon name="Plus" size={16} />
                  Добавить объект
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый объект защиты</DialogTitle>
                  <DialogDescription>Введите основные данные. Остальное можно заполнить позже.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Наименование объекта *</Label>
                    <Input
                      value={newObject.name}
                      onChange={(e) => setNewObject(p => ({ ...p, name: e.target.value }))}
                      placeholder="Например: Торговый центр «Мега»"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Адрес</Label>
                    <Input
                      value={newObject.address}
                      onChange={(e) => setNewObject(p => ({ ...p, address: e.target.value }))}
                      placeholder="г. Москва, ул. Примерная, д. 1"
                    />
                  </div>
                  <Button onClick={handleCreate} disabled={creating} className="w-full gap-2">
                    {creating ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Plus" size={16} />}
                    {creating ? 'Создание...' : 'Создать объект'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {objects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Icon name="Building2" size={64} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">Нет объектов</h3>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                {canCreate
                  ? 'Создайте первый объект защиты для начала работы'
                  : 'Вам пока не назначены объекты. Обратитесь к администратору или ответственному за ПБ.'}
              </p>
              {canCreate && (
                <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
                  <Icon name="Plus" size={16} />
                  Создать первый объект
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {objects.map((obj: FireObject) => (
              <Card
                key={obj.id}
                className="cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group"
                onClick={() => selectObject(obj)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <Icon name="Building2" size={20} className="text-blue-600" />
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:text-blue-600 transition-colors" />
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">{obj.name}</CardTitle>
                  {obj.address && (
                    <CardDescription className="flex items-start gap-1.5 line-clamp-2">
                      <Icon name="MapPin" size={14} className="flex-shrink-0 mt-0.5" />
                      {obj.address}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {obj.functional_class && <Badge variant="outline" className="text-xs">{obj.functional_class}</Badge>}
                    {obj.area && <Badge variant="secondary" className="text-xs">{obj.area} м²</Badge>}
                    {obj.floors && <Badge variant="secondary" className="text-xs">{obj.floors} эт.</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
