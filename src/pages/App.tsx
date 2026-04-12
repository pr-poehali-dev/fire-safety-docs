import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import LoadingIndicator from '@/components/LoadingIndicator';
import ChatAssistant from '@/components/ChatAssistant';
import ActivityHistory from '@/components/ActivityHistory';
import AppSidebar from '@/pages/AppSidebar';
import AppSectionRenderer from '@/pages/AppSectionRenderer';
import { ObjectData, allSections, managerSections, adminOnlySections, convertObjectToLocal } from '@/pages/appConstants';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AppPage = () => {
  const { user, currentObject, selectObject, updateObject, hasRole, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [fireIncidents, setFireIncidents] = useState<Record<string, unknown>[]>([]);

  const [objectData, setObjectData] = useState<ObjectData>(() =>
    currentObject ? convertObjectToLocal(currentObject as unknown as Record<string, unknown>) : {
      name: '', functionalClass: '', commissioningDate: '', address: '',
      fireResistance: '', structuralFireHazard: '', area: '', floorArea: '',
      height: '', floors: '', volume: '', outdoorCategory: '', buildingCategory: '',
      workplaces: '', workingHours: '', protectionSystems: '', photo: null,
    }
  );

  useEffect(() => {
    if (currentObject) {
      setObjectData(convertObjectToLocal(currentObject as unknown as Record<string, unknown>));
    }
  }, [currentObject]);

  const objectId = currentObject?.id ?? 0;

  const mainSections = (hasRole(['admin', 'responsible'])
    ? allSections
    : allSections.filter((s) => managerSections.has(s.id))
  ).filter((s) => !adminOnlySections.has(s.id) || hasRole(['admin']));

  const handleSaveObject = async () => {
    if (!currentObject) return;
    setIsLoading(true);
    try {
      const dbData: Record<string, unknown> = {
        object_id: currentObject.id,
        name: objectData.name,
        functional_class: objectData.functionalClass,
        commissioning_date: objectData.commissioningDate || null,
        address: objectData.address,
        fire_resistance: objectData.fireResistance,
        structural_fire_hazard: objectData.structuralFireHazard,
        area: objectData.area ? parseFloat(objectData.area) : null,
        floor_area: objectData.floorArea ? parseFloat(objectData.floorArea) : null,
        height: objectData.height ? parseFloat(objectData.height) : null,
        floors: objectData.floors ? parseInt(objectData.floors) : null,
        volume: objectData.volume ? parseFloat(objectData.volume) : null,
        outdoor_category: objectData.outdoorCategory,
        building_category: objectData.buildingCategory,
        workplaces: objectData.workplaces ? parseInt(objectData.workplaces) : null,
        working_hours: objectData.workingHours,
        protection_systems: objectData.protectionSystems,
        photo: objectData.photo,
      };

      const ok = await updateObject(dbData);
      if (!ok) throw new Error('Failed to save');

      toast({
        title: 'Успешно сохранено',
        description: 'Данные объекта обновлены',
      });

      const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
      logs.push({
        id: Date.now().toString(),
        action: 'Обновлены характеристики объекта',
        section: 'Характеристика объекта',
        timestamp: new Date().toISOString(),
        details: objectData.name,
      });
      localStorage.setItem('activity_logs', JSON.stringify(logs.slice(-100)));
    } catch (error) {
      console.error('Error saving object data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive',
      });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleInputChange = (field: keyof ObjectData, value: string) => {
    setObjectData(prev => ({ ...prev, [field]: value }));
  };

  const isReadOnlyCharacteristic = hasRole(['manager']);

  return (
    <>
      {isLoading && <LoadingIndicator />}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="flex">
          <AppSidebar
            sections={mainSections}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            objectName={currentObject?.name}
            onBackToList={() => selectObject(null)}
            onGoHome={() => window.location.href = '/'}
            onLogout={logout}
          />

          <div className="ml-80 flex-1 p-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <AppSectionRenderer
                  activeSection={activeSection}
                  objectData={objectData}
                  objectId={objectId}
                  fireIncidents={fireIncidents}
                  onSaveObject={handleSaveObject}
                  onInputChange={handleInputChange}
                  onFireIncidentsChange={setFireIncidents}
                  isReadOnlyCharacteristic={isReadOnlyCharacteristic}
                />
              </CardContent>
            </Card>
          </div>

          <ChatAssistant />
          <ActivityHistory />
        </div>
      </div>
    </>
  );
};

export default AppPage;
