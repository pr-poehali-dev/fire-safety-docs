import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import JournalSection from '@/components/JournalSection';
import DocumentationSection from '@/components/DocumentationSection';
import ChecklistSection from '@/components/ChecklistSection';
import DrillsSection from '@/components/DrillsSection';
import AssessmentDashboard from '@/components/AssessmentDashboard';
import ExecutiveDocsSection from '@/components/ExecutiveDocsSection';
import CalculationsSection from '@/components/CalculationsSection';
import AuditsSection from '@/components/AuditsSection';
import DeclarationSection from '@/components/DeclarationSection';
import InsuranceSection from '@/components/InsuranceSection';
import NotificationsSection from '@/components/NotificationsSection';
import ExportSection from '@/components/ExportSection';
import FAQSection from '@/components/FAQSection';
import MonitoringSection from '@/components/MonitoringSection';
import CharacteristicTab from '@/components/CharacteristicTab';
import InformingTab from '@/components/InformingTab';
import ProfileTab from '@/components/ProfileTab';
import FiresTab from '@/components/FiresTab';
import AuthLogsSection from '@/components/AuthLogsSection';
import SecurityEventsSection from '@/components/SecurityEventsSection';
import DataProtectionSection from '@/components/DataProtectionSection';
import SecurityReportSection from '@/components/SecurityReportSection';
import NetworkArchitectureSection from '@/components/NetworkArchitectureSection';
import TechnicalSolutionSection from '@/components/docs/TechnicalSolutionSection';
import TestingProgramSection from '@/components/docs/TestingProgramSection';
import AdminGuideSection from '@/components/docs/AdminGuideSection';
import { ObjectData, journalSubsections, drillFields } from '@/pages/appConstants';

interface AppSectionRendererProps {
  activeSection: string;
  objectData: ObjectData;
  objectId: number;
  fireIncidents: Record<string, unknown>[];
  onSaveObject: () => void;
  onInputChange: (field: keyof ObjectData, value: string) => void;
  onFireIncidentsChange: (incidents: Record<string, unknown>[]) => void;
  isReadOnlyCharacteristic: boolean;
}

export default function AppSectionRenderer({
  activeSection,
  objectData,
  objectId,
  fireIncidents,
  onSaveObject,
  onInputChange,
  onFireIncidentsChange,
  isReadOnlyCharacteristic,
}: AppSectionRendererProps) {
  const [activeJournalSubsection, setActiveJournalSubsection] = useState(journalSubsections[0].id);

  switch (activeSection) {
    case 'profile':
      return <ProfileTab />;
    case 'characteristic':
      return <CharacteristicTab objectData={objectData} onSave={onSaveObject} onInputChange={onInputChange} objectId={objectId} readOnly={isReadOnlyCharacteristic} />;
    case 'informing':
      return <InformingTab />;
    case 'documentation':
      return <DocumentationSection objectId={objectId} />;
    case 'monitoring':
      return <MonitoringSection objectId={objectId} />;
    case 'fires':
      return <FiresTab incidents={fireIncidents} onIncidentsChange={onFireIncidentsChange} objectId={objectId} />;
    case 'journal':
      return (
        <div className="animate-fade-in">
          <Tabs value={activeJournalSubsection} onValueChange={setActiveJournalSubsection}>
            <div className="mb-6 -mx-1 px-1 overflow-x-auto scrollbar-thin">
              <TabsList className="flex flex-nowrap sm:flex-wrap gap-1.5 bg-transparent p-0 h-auto min-w-max sm:min-w-0">
                {journalSubsections.map((subsection) => (
                  <TabsTrigger
                    key={subsection.id}
                    value={subsection.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/50 data-[state=active]:border-primary data-[state=active]:bg-primary/5 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/50 transition-all text-xs whitespace-nowrap"
                  >
                    <Icon name={subsection.icon} size={14} />
                    <span className="font-medium">{subsection.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {journalSubsections.map((subsection) => (
              <TabsContent key={subsection.id} value={subsection.id}>
                <JournalSection
                  sectionId={subsection.id}
                  title={subsection.fullTitle}
                  icon={subsection.icon}
                  color="bg-primary"
                  fields={subsection.fields}
                  headerFields={subsection.headerFields}
                  onSave={(data) => console.log('Saved:', data)}
                  objectId={objectId}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      );
    case 'checklist':
      return <ChecklistSection objectId={objectId} />;
    case 'drills':
      return <DrillsSection fields={drillFields} objectId={objectId} />;
    case 'assessment':
      return <AssessmentDashboard objectId={objectId} fireIncidents={fireIncidents} />;
    case 'executive_docs':
      return <ExecutiveDocsSection objectId={objectId} />;
    case 'calculations':
      return <CalculationsSection objectId={objectId} />;
    case 'audits':
      return <AuditsSection objectId={objectId} />;
    case 'declaration':
      return <DeclarationSection objectData={objectData} objectId={objectId} />;
    case 'insurance':
      return <InsuranceSection objectId={objectId} />;
    case 'notifications':
      return <NotificationsSection objectId={objectId} />;
    case 'export':
      return <ExportSection objectId={objectId} />;
    case 'data_protection':
      return <DataProtectionSection />;
    case 'security_report':
      return <SecurityReportSection />;
    case 'network_architecture':
      return <NetworkArchitectureSection />;
    case 'tech_solution':
      return <TechnicalSolutionSection />;
    case 'testing_program':
      return <TestingProgramSection />;
    case 'admin_guide':
      return <AdminGuideSection />;
    case 'security_events':
      return <SecurityEventsSection />;
    case 'auth_logs':
      return <AuthLogsSection />;
    case 'faq':
      return <FAQSection />;
    default:
      return <div>Раздел в разработке</div>;
  }
}