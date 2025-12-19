import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface ProfileData {
  fullName: string;
  birthDate: string;
  education: string;
  personalEmail: string;
  position?: string;
  phone?: string;
  department?: string;
}

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: 'Иванов Иван Иванович',
    birthDate: '15.03.1985',
    education: 'Высшее, Московский государственный технический университет им. Баумана, специальность: Пожарная безопасность',
    personalEmail: 'ivanov.ii@example.com',
    position: 'Инженер по пожарной безопасности',
    phone: '+7 (999) 123-45-67',
    department: 'Отдел безопасности',
  });

  const [tempData, setTempData] = useState<ProfileData>(profileData);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setTempData({ ...tempData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="User" size={24} className="text-indigo-600" />
                Личный кабинет
              </CardTitle>
              <CardDescription>Персональная информация и контактные данные</CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" className="gap-2">
                <Icon name="Edit" size={16} />
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Icon name="Check" size={16} />
                  Сохранить
                </Button>
                <Button onClick={handleCancel} variant="outline" className="gap-2">
                  <Icon name="X" size={16} />
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                <Icon name="User" size={16} className="text-indigo-600" />
                ФИО (полностью) *
              </Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={tempData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Фамилия Имя Отчество"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border text-lg font-medium">
                  {profileData.fullName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="birthDate" className="flex items-center gap-2 mb-2">
                <Icon name="Calendar" size={16} className="text-indigo-600" />
                Дата рождения *
              </Label>
              {isEditing ? (
                <Input
                  id="birthDate"
                  type="date"
                  value={tempData.birthDate.split('.').reverse().join('-')}
                  onChange={(e) => {
                    const formatted = e.target.value.split('-').reverse().join('.');
                    handleChange('birthDate', formatted);
                  }}
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {profileData.birthDate}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="personalEmail" className="flex items-center gap-2 mb-2">
                <Icon name="Mail" size={16} className="text-indigo-600" />
                Личная почта *
              </Label>
              {isEditing ? (
                <Input
                  id="personalEmail"
                  type="email"
                  value={tempData.personalEmail}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                  placeholder="example@mail.com"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {profileData.personalEmail}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="education" className="flex items-center gap-2 mb-2">
                <Icon name="GraduationCap" size={16} className="text-indigo-600" />
                Образование *
              </Label>
              {isEditing ? (
                <textarea
                  id="education"
                  value={tempData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  placeholder="Укажите уровень образования, учебное заведение, специальность"
                  className="w-full p-3 border rounded-lg min-h-[80px] bg-white dark:bg-slate-950"
                />
              ) : (
                <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                  {profileData.education}
                </p>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Briefcase" size={20} className="text-indigo-600" />
              Дополнительная информация
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="position" className="flex items-center gap-2 mb-2">
                  <Icon name="BadgeCheck" size={16} className="text-indigo-600" />
                  Должность
                </Label>
                {isEditing ? (
                  <Input
                    id="position"
                    value={tempData.position || ''}
                    onChange={(e) => handleChange('position', e.target.value)}
                    placeholder="Ваша должность"
                  />
                ) : (
                  <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                    {profileData.position || '—'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Icon name="Phone" size={16} className="text-indigo-600" />
                  Телефон
                </Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={tempData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                  />
                ) : (
                  <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                    {profileData.phone || '—'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="department" className="flex items-center gap-2 mb-2">
                  <Icon name="Building2" size={16} className="text-indigo-600" />
                  Отдел/Подразделение
                </Label>
                {isEditing ? (
                  <Input
                    id="department"
                    value={tempData.department || ''}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="Название отдела"
                  />
                ) : (
                  <p className="p-3 bg-white dark:bg-slate-950 rounded-lg border">
                    {profileData.department || '—'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Поля, отмеченные звездочкой (*), обязательны для заполнения
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Ваши персональные данные надежно защищены и используются только для ведения учета
                  специалистов по пожарной безопасности.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} className="text-emerald-600" />
            Квалификация и сертификаты
          </CardTitle>
          <CardDescription>Профессиональные достижения и документы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon name="FileCheck" size={48} className="text-emerald-400 mb-4" />
            <p className="text-muted-foreground mb-4">Раздел в разработке</p>
            <Button variant="outline" disabled>
              Добавить сертификат
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
