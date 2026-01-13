import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Seguros M1', value: 26, color: 'hsl(160, 84%, 39%)' },
  { name: 'Seguros Recorrência', value: 35, color: 'hsl(186, 100%, 42%)' },
  { name: 'Licenças Start', value: 9, color: 'hsl(217, 91%, 60%)' },
  { name: 'Licenças Pro', value: 18, color: 'hsl(240, 60%, 60%)' },
  { name: 'Licenças Elite', value: 13, color: 'hsl(38, 92%, 50%)' },
];

export function CommissionChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Composição de Comissões</h3>
        <p className="text-sm text-muted-foreground">Distribuição por tipo</p>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-foreground font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground">Total de Comissões</p>
        <p className="text-2xl font-bold text-foreground">R$ 137.000</p>
      </div>
    </div>
  );
}
