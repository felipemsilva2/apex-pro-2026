import { User, Palette, Link2, CreditCard, Bell, Users, ChevronRight, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockNutritionist } from "@/data/mockData";

const SettingsPage = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu perfil, personalizações e preferências
        </p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="perfil" className="gap-2">
            <User size={16} /> Perfil
          </TabsTrigger>
          <TabsTrigger value="whitelabel" className="gap-2">
            <Palette size={16} /> Whitelabel
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Link2 size={16} /> Integrações
          </TabsTrigger>
          <TabsTrigger value="plano" className="gap-2">
            <CreditCard size={16} /> Plano
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell size={16} /> Notificações
          </TabsTrigger>
          <TabsTrigger value="equipe" className="gap-2">
            <Users size={16} /> Equipe
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="perfil" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
                <CardDescription>Atualize seus dados profissionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {mockNutritionist.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload size={14} className="mr-2" /> Alterar Foto
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG ou PNG. Máx 2MB.</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" defaultValue={mockNutritionist.name} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="crn">CRN</Label>
                    <Input id="crn" defaultValue={mockNutritionist.crn} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={mockNutritionist.email} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input id="specialty" defaultValue={mockNutritionist.specialty} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Apresentação</Label>
                  <Textarea 
                    id="bio" 
                    className="mt-1.5" 
                    placeholder="Escreva uma breve apresentação sobre você..."
                    defaultValue="Nutricionista especializada em nutrição esportiva com mais de 8 anos de experiência."
                  />
                </div>
                <Button className="btn-dashboard">Salvar Alterações</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Links para suas redes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@seuinstagram" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" placeholder="linkedin.com/in/seuperfil" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" placeholder="www.seusite.com.br" className="mt-1.5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Whitelabel Tab */}
        <TabsContent value="whitelabel" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidade Visual</CardTitle>
                <CardDescription>Personalize a plataforma com sua marca</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste sua logo ou clique para fazer upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG ou SVG. Recomendado: 200x50px</p>
                  </div>
                </div>
                <div>
                  <Label>Cor Primária</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-lg bg-primary" />
                    <Input defaultValue="#3B82F6" className="w-32" />
                    <span className="text-sm text-muted-foreground">Atual</span>
                  </div>
                </div>
                <div>
                  <Label>Cor Secundária</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-lg bg-success" />
                    <Input defaultValue="#10B981" className="w-32" />
                    <span className="text-sm text-muted-foreground">Atual</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domínio Personalizado</CardTitle>
                <CardDescription>Configure seu próprio domínio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nome da Plataforma</Label>
                  <Input defaultValue="NutriManage Pro" className="mt-1.5" />
                </div>
                <div>
                  <Label>Domínio</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-muted-foreground">app.</span>
                    <Input placeholder="seudominio" className="flex-1" />
                    <span className="text-sm text-muted-foreground">.com.br</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Disponível apenas no plano Enterprise
                  </p>
                </div>
                <Badge variant="secondary">Recurso do plano Enterprise</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integracoes" className="mt-6">
          <div className="space-y-4">
            {[
              { name: "Google Calendar", desc: "Sincronize sua agenda", connected: false },
              { name: "Stripe", desc: "Receba pagamentos online", connected: true },
              { name: "WhatsApp Business", desc: "Envie mensagens automatizadas", connected: false },
              { name: "Mercado Pago", desc: "Pagamentos via PIX e boleto", connected: false },
            ].map((integration, i) => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">{integration.desc}</p>
                  </div>
                  {integration.connected ? (
                    <Badge className="bg-success/10 text-success gap-1">
                      <Check size={12} /> Conectado
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm">Conectar</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plano" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seu Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg mb-4">
                <div>
                  <Badge className="bg-primary mb-2">Profissional</Badge>
                  <h3 className="text-2xl font-bold">R$ 197/mês</h3>
                  <p className="text-sm text-muted-foreground">Até 100 clientes</p>
                </div>
                <Button variant="outline">Fazer Upgrade</Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Clientes utilizados</span>
                  <span className="font-medium">58 de 100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "58%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notificacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Novas mensagens", desc: "Receba notificações quando clientes enviarem mensagens" },
                { title: "Lembretes de consulta", desc: "Lembre-se das consultas do dia" },
                { title: "Renovações de plano", desc: "Aviso quando planos estiverem próximos do vencimento" },
                { title: "Relatórios semanais", desc: "Resumo semanal por email" },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{pref.title}</p>
                    <p className="text-sm text-muted-foreground">{pref.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="equipe" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Equipe</CardTitle>
              <CardDescription>Adicione outros profissionais à sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="font-semibold mb-2">Recurso disponível no plano Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione nutricionistas à sua equipe e gerencie permissões
                </p>
                <Button variant="outline">Fazer Upgrade</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
