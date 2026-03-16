import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useState, useEffect, useCallback } from 'react';

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dbProfileId, setDbProfileId] = useState<number | null>(null);
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

  const loadFromDb = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, certsRes] = await Promise.all([
        fetch(`${API_URL}?table=user_profile`),
        fetch(`${API_URL}?table=certificates`),
      ]);
      const profiles = await profileRes.json();
      const certs = await certsRes.json();

      if (profiles.length > 0) {
        const p = profiles[0];
        setDbProfileId(p.id);
        const data: ProfileData = {
          fullName: p.full_name || '',
          birthDate: p.birth_date || '',
          education: p.education || '',
          personalEmail: p.personal_email || '',
          position: p.position || '',
          phone: p.phone || '',
          department: p.department || '',
        };
        setProfileData(data);
        setTempData(data);
      }

      if (certs.length > 0) {
        setCertificates(certs.map((c: Record<string, string | number>) => ({
          id: c.id,
          institution: c.institution || '',
          educationType: c.education_type || '',
          trainingDate: c.training_date || '',
          certificateNumber: c.certificate_number || '',
        })));
      }
    } catch (error) {
      console.error('Error loading profile from DB:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromDb();
  }, [loadFromDb]);

  const handleEdit = () => {
    setIsEditing(true);
    setTempData(profileData);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        table: 'user_profile',
        full_name: tempData.fullName,
        birth_date: tempData.birthDate,
        education: tempData.education,
        personal_email: tempData.personalEmail,
        position: tempData.position || '',
        phone: tempData.phone || '',
        department: tempData.department || '',
      };

      if (dbProfileId) {
        await fetch(API_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: dbProfileId }),
        });
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        setDbProfileId(result.id);
      }

      setProfileData(tempData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTempData(profileData);
    setIsEditing(false);
  };

  const handleChange = (field: keyof ProfileData, value: string) => {
    setTempData({ ...tempData, [field]: value });
  };

  const handleAddCertificate = async () => {
    if (!newCert.institution && !newCert.certificateNumber) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'certificates',
          institution: newCert.institution,
          education_type: newCert.educationType,
          training_date: newCert.trainingDate,
          certificate_number: newCert.certificateNumber,
        }),
      });
      const result = await res.json();
      const cert: CertificateData = { ...newCert, id: result.id };
      setCertificates(prev => [...prev, cert]);
      setNewCert({ institution: '', educationType: '', trainingDate: '', certificateNumber: '' });
      setIsCertFormOpen(false);
    } catch (error) {
      console.error('Error adding certificate:', error);
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    try {
      await fetch(`${API_URL}?table=certificates&id=${id}`, { method: 'DELETE' });
      setCertificates(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting certificate:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Icon name="Loader2" size={20} className="animate-spin" />
          <span>Загрузка данных...</span>
        </div>
      </div>
    );
  }

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
                <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
                  {isSaving ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Check" size={16} />}
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
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
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
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
                  {profileData.fullName || '—'}
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
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
                  {profileData.birthDate || '—'}
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
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
                  {profileData.personalEmail || '—'}
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
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  rows={3}
                  placeholder="Учебное заведение, специальность, год"
                />
              ) : (
                <p className="min-h-[80px] px-3 py-2 bg-muted/50 rounded-md border text-sm leading-relaxed">
                  {profileData.education || '—'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="position" className="flex items-center gap-2 mb-2">
                <Icon name="Briefcase" size={16} className="text-indigo-600" />
                Должность
              </Label>
              {isEditing ? (
                <Input
                  id="position"
                  value={tempData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Должность"
                />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
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
                  value={tempData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
                  {profileData.phone || '—'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="department" className="flex items-center gap-2 mb-2">
                <Icon name="Building2" size={16} className="text-indigo-600" />
                Отдел / Подразделение
              </Label>
              {isEditing ? (
                <Input
                  id="department"
                  value={tempData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="Название отдела"
                />
              ) : (
                <p className="h-10 px-3 flex items-center bg-muted/50 rounded-md border text-sm">
                  {profileData.department || '—'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Award" size={20} className="text-amber-500" />
                Квалификация и обучение
              </CardTitle>
              <CardDescription>Удостоверения, сертификаты, свидетельства</CardDescription>
            </div>
            <Badge variant="secondary">{certificates.length} записей</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="group flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-900">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <Icon name="FileText" size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Место обучения</p>
                  <p className="font-medium">{cert.institution || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Образование</p>
                  <p>{cert.educationType || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Дата обучения</p>
                  <p>{cert.trainingDate || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Номер удостоверения</p>
                  <p>{cert.certificateNumber || '—'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteCertificate(cert.id)}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          ))}

          {isCertFormOpen ? (
            <div className="p-4 border-2 border-dashed border-amber-200 rounded-xl space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Место обучения</Label>
                  <Input
                    value={newCert.institution}
                    onChange={(e) => setNewCert({ ...newCert, institution: e.target.value })}
                    placeholder="Учебный центр / организация"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Образование</Label>
                  <Input
                    value={newCert.educationType}
                    onChange={(e) => setNewCert({ ...newCert, educationType: e.target.value })}
                    placeholder="Тип обучения"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Дата обучения</Label>
                  <Input
                    type="date"
                    value={newCert.trainingDate}
                    onChange={(e) => setNewCert({ ...newCert, trainingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Номер удостоверения</Label>
                  <Input
                    value={newCert.certificateNumber}
                    onChange={(e) => setNewCert({ ...newCert, certificateNumber: e.target.value })}
                    placeholder="Серия и номер"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setIsCertFormOpen(false); setNewCert({ institution: '', educationType: '', trainingDate: '', certificateNumber: '' }); }}>
                  Отмена
                </Button>
                <Button onClick={handleAddCertificate} className="gap-2">
                  <Icon name="Check" size={16} />
                  Добавить
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full border-dashed border-amber-300 text-amber-600 hover:bg-amber-50 gap-2"
              onClick={() => setIsCertFormOpen(true)}
            >
              <Icon name="Plus" size={16} />
              Добавить удостоверение
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}