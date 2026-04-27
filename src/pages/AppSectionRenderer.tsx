import { useState, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ObjectData, journalSubsections, drillFields } from '@/pages/appConstants';

// Лёгкие разделы — грузим сразу
import ProfileTab from '@/components/ProfileTab';
import CharacteristicTab from '@/components/CharacteristicTab';

// Тяжёлые разделы — загружаются по требованию (lazy loading)
const JournalSection = lazy(() => import('@/components/JournalSection'));
const DocumentationSection = lazy(() => import('@/components/DocumentationSection'));
const ChecklistSection = lazy(() => import('@/components/ChecklistSection'));
const DrillsSection = lazy(() => import('@/components/DrillsSection'));
const AssessmentDashboard = lazy(() => import('@/components/AssessmentDashboard'));
const ExecutiveDocsSection = lazy(() => import('@/components/ExecutiveDocsSection'));
const CalculationsSection = lazy(() => import('@/components/CalculationsSection'));
const AuditsSection = lazy(() => import('@/components/AuditsSection'));
const DeclarationSection = lazy(() => import('@/components/DeclarationSection'));
const InsuranceSection = lazy(() => import('@/components/InsuranceSection'));
const NotificationsSection = lazy(() => import('@/components/NotificationsSection'));
const ExportSection = lazy(() => import('@/components/ExportSection'));
const FAQSection = lazy(() => import('@/components/FAQSection'));
const MonitoringSection = lazy(() => import('@/components/MonitoringSection'));
const InformingTab = lazy(() => import('@/components/InformingTab'));
const FiresTab = lazy(() => import('@/components/FiresTab'));
const AuthLogsSection = lazy(() => import('@/components/AuthLogsSection'));
const SecurityEventsSection = lazy(() => import('@/components/SecurityEventsSection'));
const DataProtectionSection = lazy(() => import('@/components/DataProtectionSection'));
const SecurityReportSection = lazy(() => import('@/components/SecurityReportSection'));
const NetworkArchitectureSection = lazy(() => import('@/components/NetworkArchitectureSection'));
const TechnicalSolutionSection = lazy(() => import('@/components/docs/TechnicalSolutionSection'));
const TestingProgramSection = lazy(() => import('@/components/docs/TestingProgramSection'));
const AdminGuideSection = lazy(() => import('@/components/docs/AdminGuideSection'));

const SectionFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="flex items-center gap-3 text-muted-foreground">
      <Icon name="Loader2" size={20} className="animate-spin" />
      <span className="text-sm">Загрузка раздела...</span>
    </div>
  </div>
);

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

  const renderSection = () => {
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
  };

  return (
    <Suspense fallback={<SectionFallback />}>
      {renderSection()}
    </Suspense>
  );
}