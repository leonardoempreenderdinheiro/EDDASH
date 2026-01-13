import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { month: 'Jan', consultores: 140, vendas: 80 },
  { month: 'Fev', consultores: 150, vendas: 95 },
  { month: 'Mar', consultores: 200, vendas: 130 },
  { month: 'Abr', consultores: 280, vendas: 180 },
  { month: 'Mai', consultores: 380, vendas: 280 },
  { month: 'Jun', consultores: 450, vendas: 350 },
  { month: 'Jul', consultores: 550, vendas: 480 },
];

export function NetworkGrowthChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Crescimento da Rede</h3>
        <p className="text-sm text-muted-foreground">Evolução de consultores e vendas</p>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorConsultores" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)"
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(222, 41%, 10%)', 
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => <span style={{ color: 'hsl(215, 20%, 55%)' }}>{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="consultores" 
              name="Consultores"
              stroke="hsl(160, 84%, 39%)" 
              fillOpacity={1} 
              fill="url(#colorConsultores)" 
              strokeWidth={2}
            />
            <Area 
              type="monotone" 
              dataKey="vendas" 
              name="Vendas"
              stroke="hsl(217, 91%, 60%)" 
              fillOpacity={1} 
              fill="url(#colorVendas)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
