import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { NETWORK_DIAGRAM_ZONES } from './networkArchitectureData';

export default function NetworkDiagramTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NETWORK_DIAGRAM_ZONES.map((zone) => (
          <Card key={zone.zone} className={`border-2 ${zone.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Icon name="Layers" size={16} />
                {zone.zone}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {zone.components.map((c) => (
                  <div key={c} className="flex items-center gap-2 text-sm">
                    <Icon name="Server" size={14} className="text-muted-foreground" />
                    {c}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="text-center p-3 bg-slate-100 rounded-lg border w-full max-w-xs">
              <Icon name="Globe" size={20} className="mx-auto mb-1 text-slate-500" />
              <p className="text-xs font-medium">Интернет (пользователи)</p>
            </div>
            <Icon name="ArrowDown" size={20} className="text-blue-500" />
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
              <Badge variant="outline" className="border-blue-300">443 HTTPS</Badge>
              <Badge variant="outline" className="border-blue-300">22 SSH (VPN)</Badge>
            </div>
            <Icon name="ArrowDown" size={20} className="text-blue-500" />
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-300 w-full max-w-xs">
              <Icon name="Shield" size={20} className="mx-auto mb-1 text-red-500" />
              <p className="text-xs font-medium text-red-700">Межсетевой экран (МСЭ)</p>
              <p className="text-[10px] text-red-500">Deny All + Allow List</p>
            </div>
            <Icon name="ArrowDown" size={20} className="text-green-500" />
            <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
              {['Auth API', 'DB API', 'Security Log'].map((svc) => (
                <div key={svc} className="text-center p-2 bg-green-50 rounded-lg border border-green-300">
                  <Icon name="Cloud" size={16} className="mx-auto mb-1 text-green-600" />
                  <p className="text-[10px] font-medium">{svc}</p>
                </div>
              ))}
            </div>
            <Icon name="ArrowDown" size={20} className="text-amber-500" />
            <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
              <Badge variant="outline" className="border-amber-300">5432 PostgreSQL/SSL</Badge>
            </div>
            <Icon name="ArrowDown" size={20} className="text-amber-500" />
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-300 w-full max-w-xs">
              <Icon name="Database" size={20} className="mx-auto mb-1 text-amber-600" />
              <p className="text-xs font-medium text-amber-700">PostgreSQL (managed)</p>
              <p className="text-[10px] text-amber-500">AES-256 шифрование ПДн</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
