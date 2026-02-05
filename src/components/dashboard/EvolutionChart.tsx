import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { mockEvolutionData } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EvolutionChart = () => {
  return (
    <div className="athletic-card group">
      <div className="kinetic-border" />
      <div className="absolute top-0 right-0 w-64 h-full bg-primary/5 -skew-x-[45deg] translate-x-32" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="stat-label">Performance Global</h3>
          <p className="text-4xl lg:text-6xl font-display font-black italic uppercase tracking-tighter mt-1 leading-[0.8]">
            POWER <span className="text-primary text-blur-sm">STATUS</span>
          </p>
          <div className="h-0.5 w-12 bg-primary mt-4" />
        </div>
      </div>

      <Tabs defaultValue="weight" className="w-full relative z-10">
        <TabsList className="mb-8 w-full justify-start bg-transparent border-b border-white/5 rounded-none h-auto p-0 gap-8">
          <TabsTrigger value="weight" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all">
            CONSISTÊNCIA ALUNOS
          </TabsTrigger>
          <TabsTrigger value="clients" className="bg-transparent border-none rounded-none p-0 pb-4 data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary font-display font-bold uppercase italic text-[10px] tracking-widest transition-all">
            CRESCIMENTO DA REDE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="mt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockEvolutionData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0B",
                    border: "1px solid rgba(212, 255, 0, 0.2)",
                    borderRadius: "0px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                    fontFamily: 'Syne, sans-serif',
                  }}
                  itemStyle={{ color: "#D4FF00", fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: "#ffffff", fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                  cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="avgWeight"
                  stroke="#D4FF00"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#D4FF00", strokeWidth: 4, stroke: "#0A0A0B" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between mt-8 p-4 bg-white/5 border border-white/5">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Média do Semestre</p>
              <p className="text-xl font-display font-black text-primary italic leading-none mt-1">+12.4% ADESÃO</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Performance</p>
              <p className="text-xl font-display font-black text-white italic leading-none mt-1 uppercase">Top Speed</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="mt-0">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockEvolutionData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="#ffffff40"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0A0B",
                    border: "1px solid rgba(212, 255, 0, 0.2)",
                    borderRadius: "0px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
                    fontFamily: 'Syne, sans-serif',
                  }}
                  itemStyle={{ color: "#D4FF00", fontWeight: 'bold', fontSize: '12px' }}
                  labelStyle={{ color: "#ffffff", fontWeight: 'bold', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                />
                <Bar
                  dataKey="clients"
                  fill="#D4FF00"
                  opacity={0.8}
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary -skew-x-12" />
              <p className="text-[10px] font-bold text-white uppercase tracking-widest italic">+4 novos alunos este mês</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EvolutionChart;
