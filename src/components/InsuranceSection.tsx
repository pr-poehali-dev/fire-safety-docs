import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Insurance {
  policyNumber: string;
  organization: string;
  insured: string;
  amount: string;
}

const API_URL = 'https://functions.poehali.dev/6adbead7-91c0-4ddd-852f-dc7fa75a8188';

export default function InsuranceSection() {
  const [insurances, setInsurances] = useState<Insurance[]>([]);

  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    try {
      const response = await fetch(`${API_URL}?table=insurance_policies`);
      const data = await response.json();
      const loadedInsurances = data.map((item: any) => ({
        policyNumber: item.policy_number || '',
        organization: item.organization || '',
        insured: item.insured_object || '',
        amount: item.amount?.toString() || '',
      }));
      setInsurances(loadedInsurances);
    } catch (error) {
      console.error('Error loading insurances:', error);
    }
  };
  const [newInsurance, setNewInsurance] = useState<Insurance>({
    policyNumber: '',
    organization: '',
    insured: '',
    amount: '',
  });

  const handleInputChange = (field: keyof Insurance, value: string) => {
    setNewInsurance((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInsurance = async () => {
    if (newInsurance.policyNumber && newInsurance.organization) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            table: 'insurance_policies',
            policy_number: newInsurance.policyNumber,
            organization: newInsurance.organization,
            insured_object: newInsurance.insured,
            amount: parseFloat(newInsurance.amount) || null,
          }),
        });
        
        if (response.ok) {
          setInsurances((prev) => [...prev, newInsurance]);
          setNewInsurance({
            policyNumber: '',
            organization: '',
            insured: '',
            amount: '',
          });
          alert('Страховой полис успешно добавлен в базу данных');
          loadInsurances();
        }
      } catch (error) {
        console.error('Error saving insurance:', error);
        alert('Ошибка при сохранении полиса');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center">
            <Icon name="Shield" className="text-white" size={24} />
          </div>
          <div>
            <CardTitle>Страхование объекта</CardTitle>
            <CardDescription>Учет страховых полисов объекта защиты</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Добавить полис страхования</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy-number">Номер полиса</Label>
                <Input
                  id="policy-number"
                  value={newInsurance.policyNumber}
                  onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                  placeholder="Введите номер полиса"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Страховая организация</Label>
                <Input
                  id="organization"
                  value={newInsurance.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Наименование организации"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insured">Страхователь</Label>
                <Input
                  id="insured"
                  value={newInsurance.insured}
                  onChange={(e) => handleInputChange('insured', e.target.value)}
                  placeholder="Наименование страхователя"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Сумма (руб.)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newInsurance.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleAddInsurance}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить полис
            </Button>
          </CardContent>
        </Card>

        {insurances.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">№</TableHead>
                  <TableHead>Номер полиса</TableHead>
                  <TableHead>Страховая организация</TableHead>
                  <TableHead>Страхователь</TableHead>
                  <TableHead>Сумма (руб.)</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {insurances.map((insurance, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{index + 1}</TableCell>
                    <TableCell className="text-sm font-medium">{insurance.policyNumber}</TableCell>
                    <TableCell className="text-sm">{insurance.organization}</TableCell>
                    <TableCell className="text-sm">{insurance.insured}</TableCell>
                    <TableCell className="text-sm font-semibold">
                      {parseInt(insurance.amount).toLocaleString('ru-RU')}
                    </TableCell>
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

        {insurances.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Icon name="Shield" size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Полисы страхования не добавлены</p>
            </CardContent>
          </Card>
        )}

        {insurances.length > 0 && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base">Общая страховая сумма</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {insurances
                  .reduce((sum, ins) => sum + parseInt(ins.amount || '0'), 0)
                  .toLocaleString('ru-RU')} ₽
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}