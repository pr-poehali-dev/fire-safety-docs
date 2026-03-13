import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface ProfileData {
  fullName: string;
  birthDate: string;
  education: string;
  personalEmail: string;
  position?: string;
  phone?: string;
  department?: string;
}

interface CertificateData {
  id: number;
  institution: string;
  educationType: string;
  trainingDate: string;
  certificateNumber: string;
}

export default function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    birthDate: '',
    education: '',
    personalEmail: '',
    position: '',
    phone: '',
    department: '',
  });

  const [tempData, setTempData] = useState<ProfileData>(profileData);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [newCert, setNewCert] = useState<Omit<CertificateData, 'id'>>({ institution: '', educationType: '', trainingDate: '', certificateNumber: '' });
  const [isCertFormOpen, setIsCertFormOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('profileData');
    if (stored) {
      const data = JSON.parse(stored);
      setProfileData(data);
      setTempData(data);
    } else {
      const defaultData = {
        fullName: 'Иванов Иван Иванович',
        birthDate: '15.03.1985',
        education: 'Высшее, Московский государственный технический университет им. Баумана, специальность: Пожарная безопасность',
        personalEmail: 'ivanov.ii@example.com',
        position: 'Инженер по пожарной безопасности',
        phone: '+7 (999) 123-45-67',
        department: 'Отдел безопасности',
      };
      setProfileData(defaultData);
      setTempData(defaultData);
      localStorage.setItem('profileData', JSON.stringify(defaultData));
    }
    const storedCerts = localStorage.getItem('certificates');
    if (storedCerts) {
      setCertificates(JSON.parse(storedCerts));
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = () => {
    setProfileData(tempData);
    localStorage.setItem('profileData', JSON.stringify(tempData));
    setIsEditing(false);
    
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push({
      id: Date.now().toString(),
      action: 'Обновлен профиль',
      section: 'Личный кабинет',
      timestamp: new Date().toISOString(),
      details: tempData.fullName,
    });
    localStorage.setItem('activity_logs', JSON.stringify(logs.slice(-100)));
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setTempData({ ...tempData, [field]: value });
  };

  const handleAddCertificate = () => {
    if (!newCert.institution && !newCert.certificateNumber) return;
    const cert: CertificateData = { ...newCert, id: Date.now() };
    const updated = [...certificates, cert];
    setCertificates(updated);
    localStorage.setItem('certificates', JSON.stringify(updated));
    setNewCert({ institution: '', educationType: '', trainingDate: '', certificateNumber: '' });
    setIsCertFormOpen(false);

    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push({
      id: Date.now().toString(),
      action: 'Добавлен сертификат',
      section: 'Квалификация',
      timestamp: new Date().toISOString(),
      details: newCert.institution,
    });
    localStorage.setItem('activity_logs', JSON.stringify(logs.slice(-100)));
  };

  const handleDeleteCertificate = (id: number) => {
    const updated = certificates.filter(c => c.id !== id);
    setCertificates(updated);
    localStorage.setItem('certificates', JSON.stringify(updated));
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Award" size={20} className="text-emerald-600" />
                Квалификация и сертификаты
              </CardTitle>
              <CardDescription>Профессиональные достижения и документы</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">{certificates.length} записей</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.length > 0 && (
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div key={cert.id} className="group p-4 bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-800 rounded-xl hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                      <Icon name="GraduationCap" size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Место обучения</p>
                        <p className="text-sm font-medium">{cert.institution || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Образование</p>
                        <p className="text-sm">{cert.educationType || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Дата обучения</p>
                        <p className="text-sm">{cert.trainingDate ? new Date(cert.trainingDate).toLocaleDateString('ru-RU') : '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Номер удостоверения</p>
                        <p className="text-sm font-mono">{cert.certificateNumber || '—'}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => handleDeleteCertificate(cert.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {certificates.length === 0 && !isCertFormOpen && (
            <div className="text-center py-8 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30">
              <Icon name="FileCheck" size={32} className="mx-auto text-emerald-300 mb-2" />
              <p className="text-sm text-muted-foreground">Сертификатов пока нет</p>
              <p className="text-xs text-muted-foreground mt-1">Добавьте сведения об обучении и квалификации</p>
            </div>
          )}

          {isCertFormOpen ? (
            <Card className="border-emerald-200 shadow-md">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon name="PlusCircle" size={16} className="text-emerald-500" />
                  Новый сертификат
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Место обучения</Label>
                    <Input
                      value={newCert.institution}
                      onChange={(e) => setNewCert({ ...newCert, institution: e.target.value })}
                      placeholder="Учебное заведение / учебный центр"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Образование</Label>
                    <Input
                      value={newCert.educationType}
                      onChange={(e) => setNewCert({ ...newCert, educationType: e.target.value })}
                      placeholder="Повышение квалификации / переподготовка"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Дата обучения</Label>
                    <Input
                      type="date"
                      value={newCert.trainingDate}
                      onChange={(e) => setNewCert({ ...newCert, trainingDate: e.target.value })}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Номер удостоверения</Label>
                    <Input
                      value={newCert.certificateNumber}
                      onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                      placeholder="№ удостоверения / сертификата"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setIsCertFormOpen(false); setNewCert({ institution: '', educationType: '', trainingDate: '', certificateNumber: '' }); }} className="text-xs">
                    Отмена
                  </Button>
                  <Button size="sm" onClick={handleAddCertificate} className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                    <Icon name="Check" size={14} />
                    Сохранить
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-2 border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-muted-foreground hover:text-emerald-600 transition-all h-10 rounded-xl"
              onClick={() => setIsCertFormOpen(true)}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить сертификат
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}