import ObjectInfoCard from '@/components/characteristic/ObjectInfoCard';
import ProtectionSystemsCard from '@/components/characteristic/ProtectionSystemsCard';
import RoomsCategoriesCard from '@/components/characteristic/RoomsCategoriesCard';
import ObjectSummaryCards from '@/components/characteristic/ObjectSummaryCards';

interface ObjectData {
  name: string;
  functionalClass: string;
  commissioningDate: string;
  address: string;
  fireResistance: string;
  structuralFireHazard: string;
  area: string;
  floorArea: string;
  height: string;
  floors: string;
  volume: string;
  outdoorCategory: string;
  buildingCategory: string;
  workplaces: string;
  workingHours: string;
  protectionSystems: string;
  photo?: string | null;
}

interface CharacteristicTabProps {
  objectData: ObjectData;
  onSave: () => void;
  onInputChange: (field: keyof ObjectData, value: string) => void;
  objectId?: number;
  readOnly?: boolean;
}

export default function CharacteristicTab({ objectData, onSave, onInputChange, objectId, readOnly }: CharacteristicTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
      <ObjectInfoCard
        objectData={objectData}
        onSave={onSave}
        onInputChange={onInputChange}
        readOnly={readOnly}
      />
      <ProtectionSystemsCard objectId={objectId} readOnly={readOnly} />
      <RoomsCategoriesCard objectId={objectId} readOnly={readOnly} />
      <ObjectSummaryCards objectId={objectId} />
    </div>
  );
}