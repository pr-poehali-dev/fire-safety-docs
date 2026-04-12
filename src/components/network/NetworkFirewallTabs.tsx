import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { INBOUND_RULES, OUTBOUND_RULES, INTERACTION_TABLE } from './networkArchitectureData';
import type { FirewallRule } from './networkArchitectureData';

function FirewallRulesTable({ rules, isOutbound }: { rules: FirewallRule[]; isOutbound?: boolean }) {
  return (
    <>
      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-[60px]">ID</TableHead>
              <TableHead>Источник</TableHead>
              <TableHead className="w-[60px]">Порт</TableHead>
              <TableHead>Протокол</TableHead>
              <TableHead>Назначение</TableHead>
              <TableHead className="w-[80px]">Действие</TableHead>
              <TableHead>Ответственный</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((r) => (
              <TableRow key={r.id} className="text-xs">
                <TableCell className="font-mono font-bold">{r.id}</TableCell>
                <TableCell>{r.source}</TableCell>
                <TableCell className="font-mono">{r.dstPort}</TableCell>
                <TableCell>{r.protocol}</TableCell>
                <TableCell>{r.destination}</TableCell>
                <TableCell>
                  <Badge className={
                    r.action === 'ALLOW' ? 'bg-green-100 text-green-700' :
                    r.action === 'DENY' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }>{r.action}</Badge>
                </TableCell>
                <TableCell>{r.responsible}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 space-y-2">
        <h4 className="text-sm font-semibold">Обоснования</h4>
        {rules.map((r) => (
          <div key={r.id} className="flex gap-2 text-xs p-2 bg-slate-50 rounded border">
            <Badge variant="outline" className="flex-shrink-0">{r.id}</Badge>
            <span className="text-muted-foreground">{r.justification}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function InboundRulesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="ArrowDownToLine" size={18} className="text-green-600" />
          Входящие правила МСЭ
        </CardTitle>
        <CardDescription>Разрешённые входящие соединения. Все остальные — DENY.</CardDescription>
      </CardHeader>
      <CardContent>
        <FirewallRulesTable rules={INBOUND_RULES} />
      </CardContent>
    </Card>
  );
}

export function OutboundRulesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="ArrowUpFromLine" size={18} className="text-orange-600" />
          Исходящие правила МСЭ
        </CardTitle>
        <CardDescription>Разрешённые исходящие соединения. Все остальные — DENY.</CardDescription>
      </CardHeader>
      <CardContent>
        <FirewallRulesTable rules={OUTBOUND_RULES} isOutbound />
      </CardContent>
    </Card>
  );
}

export function InteractionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="ArrowLeftRight" size={18} className="text-indigo-600" />
          Таблица информационных взаимодействий
        </CardTitle>
        <CardDescription>Все потоки данных между компонентами системы</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Источник</TableHead>
                <TableHead className="w-[50px]">Порт</TableHead>
                <TableHead>Протокол</TableHead>
                <TableHead>Цель</TableHead>
                <TableHead>Тип данных</TableHead>
                <TableHead>Частота</TableHead>
                <TableHead>Классификация</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INTERACTION_TABLE.map((r, i) => (
                <TableRow key={i} className="text-xs">
                  <TableCell className="font-medium">{r.from}</TableCell>
                  <TableCell className="font-mono">{r.port}</TableCell>
                  <TableCell>{r.protocol}</TableCell>
                  <TableCell>{r.to}</TableCell>
                  <TableCell>{r.dataType}</TableCell>
                  <TableCell className="text-muted-foreground">{r.frequency}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      r.classification === 'Конфиденциальные' ? 'border-red-300 text-red-600' :
                      r.classification === 'Служебные' ? 'border-amber-300 text-amber-600' :
                      'border-green-300 text-green-600'
                    }>{r.classification}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
