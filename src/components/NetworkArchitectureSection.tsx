import { useState, useRef } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { createPDF, setFontBold, setFontNormal } from '@/lib/pdfUtils';
import { INBOUND_RULES, OUTBOUND_RULES, INTERACTION_TABLE } from '@/components/network/networkArchitectureData';
import NetworkDiagramTab from '@/components/network/NetworkDiagramTab';
import { InboundRulesTab, OutboundRulesTab, InteractionsTab } from '@/components/network/NetworkFirewallTabs';

export default function NetworkArchitectureSection() {
  const [activeTab, setActiveTab] = useState('diagram');
  const printRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    const doc = await createPDF('p');
    const pageW = 190;
    let y = 15;

    doc.setFontSize(16);
    setFontBold(doc);
    doc.text('Сетевая архитектура и правила МСЭ', 10, y);
    y += 8;
    doc.setFontSize(9);
    setFontNormal(doc);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`, 10, y);
    y += 8;

    const addTitle = (text: string, size: number) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setFontSize(size);
      setFontBold(doc);
      doc.text(text, 10, y);
      y += size * 0.5;
      setFontNormal(doc);
      doc.setFontSize(7);
    };

    const addTableRow = (cells: string[], widths: number[], header = false) => {
      if (y > 275) { doc.addPage(); y = 15; }
      let x = 10;
      let maxH = 4;
      cells.forEach((c, i) => {
        const lines = doc.splitTextToSize(c, widths[i] - 2);
        maxH = Math.max(maxH, lines.length * 3 + 1);
      });
      if (header) { setFontBold(doc); } else { setFontNormal(doc); }
      cells.forEach((c, i) => {
        const lines = doc.splitTextToSize(c, widths[i] - 2);
        lines.forEach((l: string, li: number) => doc.text(l, x + 1, y + li * 3));
        doc.rect(x, y - 3, widths[i], maxH);
        x += widths[i];
      });
      y += maxH;
    };

    addTitle('1. Входящие правила (Inbound)', 12);
    y += 2;
    const inW = [14, 30, 12, 22, 28, 18, pageW - 124];
    addTableRow(['ID', 'Источник', 'Порт', 'Протокол', 'Назначение', 'Действие', 'Обоснование'], inW, true);
    INBOUND_RULES.forEach(r => {
      addTableRow([r.id, r.source, r.dstPort, r.protocol.split('/').pop() || '', r.destination, r.action, r.justification], inW);
    });
    y += 5;

    addTitle('2. Исходящие правила (Outbound)', 12);
    y += 2;
    addTableRow(['ID', 'Источник', 'Порт', 'Протокол', 'Назначение', 'Действие', 'Обоснование'], inW, true);
    OUTBOUND_RULES.forEach(r => {
      addTableRow([r.id, r.source, r.dstPort, r.protocol.split('/').pop() || '', r.destination, r.action, r.justification], inW);
    });
    y += 5;

    doc.addPage();
    y = 15;
    addTitle('3. Таблица информационных взаимодействий', 12);
    y += 2;
    const intW = [28, 12, 22, 28, 34, 22, pageW - 146];
    addTableRow(['Источник', 'Порт', 'Протокол', 'Цель', 'Данные', 'Частота', 'Класс.'], intW, true);
    INTERACTION_TABLE.forEach(r => {
      addTableRow([r.from, r.port, r.protocol.split('/').pop() || r.protocol, r.to, r.dataType, r.frequency, r.classification], intW);
    });

    doc.save('setevaya-arhitektura-mse.pdf');
  };

  return (
    <div className="space-y-6 animate-in fade-in" ref={printRef}>
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Network" size={24} className="text-blue-600" />
                Сетевая архитектура
              </CardTitle>
              <CardDescription>Правила МСЭ, таблица взаимодействий и зоны безопасности</CardDescription>
            </div>
            <Button onClick={handleExportPDF} className="gap-1.5">
              <Icon name="Download" size={14} />
              Экспорт PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="diagram">Схема зон</TabsTrigger>
          <TabsTrigger value="inbound">Входящие правила</TabsTrigger>
          <TabsTrigger value="outbound">Исходящие правила</TabsTrigger>
          <TabsTrigger value="interactions">Взаимодействия</TabsTrigger>
        </TabsList>

        <TabsContent value="diagram" className="space-y-4 mt-4">
          <NetworkDiagramTab />
        </TabsContent>

        <TabsContent value="inbound" className="mt-4">
          <InboundRulesTab />
        </TabsContent>

        <TabsContent value="outbound" className="mt-4">
          <OutboundRulesTab />
        </TabsContent>

        <TabsContent value="interactions" className="mt-4">
          <InteractionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}