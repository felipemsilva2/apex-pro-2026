import { useState, useEffect, useRef } from "react";
import { User, Palette, RefreshCw, CreditCard, Bell, Users, Camera, Save, Loader2, Crown, CheckCircle2, UserPlus, ExternalLink, Globe, Instagram, Link2, Upload, Image, Trash2, Music, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTenantSettings, useUpdateTenantSettings, useCoachTeam } from "@/hooks/useCoachData";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { InviteCoachDialog } from "@/components/dashboard/InviteCoachDialog";
import { SubscriptionManager } from "@/components/dashboard/SubscriptionManager";

const SettingsPage = () => {
  const { profile, refetchProfile } = useAuth();
  const { data: tenant, isLoading: loadingTenant, refetch: refetchTenant } = useTenantSettings();
  const { refetchTenant: refetchGlobalTenant } = useTenant();
  const { data: team } = useCoachTeam();
  const updateTenantMutation = useUpdateTenantSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    cref: "",
    specialty: "",
    bio: "",
    education: "",
    instagram: "",
    website: "",
    spotify_playlist_url: "",
  });

  const [brandSettings, setBrandSettings] = useState({
    business_name: "",
    primary_color: "",
    secondary_color: "",
    slug: "",
  });

  const [terminology, setTerminology] = useState<Record<string, string>>({
    training: "Treino",
    nutrition: "Dieta",
    protocols: "Protocolos",
    progress: "Evolução",
    appointments: "Agenda",
    messages: "Chat"
  });

  const [landingConfig, setLandingConfig] = useState({
    hero_title: "",
    hero_subtitle: "",
    about_text: "",
    custom_benefits: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: (profile as any).email || "",
        cref: (profile as any).cref || "",
        specialty: (profile as any).specialty || "",
        bio: (profile as any).bio || "",
        education: (profile as any).education || "",
        instagram: (profile as any).instagram || "",
        website: (profile as any).website || "",
        spotify_playlist_url: (profile as any).spotify_playlist_url || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (tenant) {
      setBrandSettings({
        business_name: tenant.business_name || "",
        primary_color: tenant.primary_color || "#d4ff00",
        secondary_color: tenant.secondary_color || "#09090b",
        slug: tenant.slug || "",
      });

      if (tenant.terminology) {
        setTerminology(tenant.terminology);
      }

      if (tenant.landing_page_config) {
        setLandingConfig({
          hero_title: tenant.landing_page_config.hero_title || "",
          hero_subtitle: tenant.landing_page_config.hero_subtitle || "",
          about_text: tenant.landing_page_config.about_text || "",
          custom_benefits: tenant.landing_page_config.custom_benefits || [],
        });
      }
    }
  }, [tenant]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          email: profileData.email,
          cref: profileData.cref,
          specialty: profileData.specialty,
          bio: profileData.bio,
          education: profileData.education,
          instagram: profileData.instagram,
          website: profileData.website,
          spotify_playlist_url: profileData.spotify_playlist_url,
        })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
      refetchProfile(profile.id);
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil", { description: error.message });
    }
  };

  const handleSaveBrand = async () => {
    console.log('[Settings] Saving brand settings:', { ...brandSettings, terminology, landing_page_config: landingConfig });
    try {
      await updateTenantMutation.mutateAsync({
        ...brandSettings,
        terminology,
        landing_page_config: landingConfig
      });

      // Update title immediately for instant feedback
      if (brandSettings.business_name) {
        document.title = `${brandSettings.business_name} | DASHBOARD`;
      }

      refetchGlobalTenant();
      console.log('[Settings] Brand settings saved successfully');
    } catch (error: any) {
      console.error('[Settings] Error saving brand settings:', error);
      toast.error("Erro ao salvar configurações", {
        description: error.message || "Verifique sua conexão e tente novamente."
      });
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 2MB");
      return;
    }

    if (!file.type.match(/^image\/(png|jpeg|svg\+xml)$/)) {
      toast.error("Apenas PNG, JPE ou SVG são permitidos");
      return;
    }

    try {
      setLogoUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenant?.id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      await updateTenantMutation.mutateAsync({ logo_url: publicUrl });
      toast.success("Logo atualizado com sucesso!");
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error("Erro ao fazer upload do logo", { description: error.message });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 2MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error("Apenas imagens são permitidas");
      return;
    }

    try {
      setAvatarUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Updating profile avatar_url with:", publicUrl, "for profile ID:", profile.id);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        console.error("Error updating profiles table:", updateError);
        throw updateError;
      }

      console.log("Profile updated successfully in database");
      toast.success("Foto de perfil atualizada com sucesso!");
      refetchProfile(profile.id);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error("Erro ao fazer upload da foto", { description: error.message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      if (!tenant) return;
      await updateTenantMutation.mutateAsync({ logo_url: null });
      toast.success("Logo removido com sucesso!");
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast.error("Erro ao remover logo", { description: error.message });
    }
  };

  if (loadingTenant) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-8 space-y-12 pb-24">
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-1 h-12 bg-primary" />
          <div>
            <h1 className="font-display font-black italic uppercase text-5xl tracking-tighter leading-none">
              CONFIGURAÇÕES <span className="text-primary text-glow-primary">{tenant?.business_name || 'PERSONAL'}</span>
            </h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-[0.3em] font-display">
              GESTÃO DO SISTEMA E CONTA
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="identidade" className="space-y-8">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-none h-14 overflow-x-auto overflow-y-hidden max-w-full justify-start">
          {[
            { id: 'identidade', icon: User, label: 'IDENTIDADE' },
            { id: 'branding', icon: Palette, label: 'BRANDING' },
            { id: 'vocabulary', icon: Zap, label: 'VOCABULÁRIO' },
            { id: 'public-page', icon: Globe, label: 'PÁGINA PÚBLICA' },
            { id: 'assinatura', icon: CreditCard, label: 'ASSINATURA' },
            { id: 'equipe', icon: Users, label: 'EQUIPE' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="rounded-none font-display font-black italic uppercase text-[10px] tracking-widest px-6 data-[state=active]:bg-primary data-[state=active]:text-black transition-all shrink-0"
            >
              <tab.icon size={14} className="mr-2" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* --- IDENTIDADE --- */}
        <TabsContent value="identidade" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl" />

              <div className="space-y-2">
                <h3 className="font-display font-black italic uppercase text-lg tracking-tight">
                  INFORMAÇÕES <span className="text-primary">PROFISSIONAIS</span>
                </h3>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-8 relative z-10">
                <input
                  type="file"
                  ref={avatarInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                />
                <div className="relative group">
                  <div className={`w-24 h-24 bg-black border-2 ${avatarUploading ? 'border-primary animate-pulse' : 'border-primary/20'} flex items-center justify-center -skew-x-12 overflow-hidden`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover skew-x-12 scale-110" />
                    ) : (
                      <span className="font-display font-black text-3xl italic text-primary/60 skew-x-12">
                        {profileData.full_name?.substring(0, 2).toUpperCase() || 'FS'}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <p>PNG / JPG - MÁX 2MB</p>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="text-primary hover:underline mt-1 disabled:opacity-50"
                  >
                    {avatarUploading ? 'ENVIANDO...' : 'ALTERAR FOTO'}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">NOME COMPLETO</Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData(s => ({ ...s, full_name: e.target.value }))}
                    placeholder="DR. FELIPE SILVA"
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">REGISTRO PROFISSIONAL (CREF)</Label>
                  <Input
                    value={profileData.cref}
                    onChange={(e) => setProfileData(s => ({ ...s, cref: e.target.value }))}
                    placeholder="CREF 012345-G/SP"
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">EMAIL DE CONTATO</Label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData(s => ({ ...s, email: e.target.value }))}
                    placeholder="CONTATO@APEXPRO.PRO"
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">ESPECIALIDADE PRINCIPAL</Label>
                  <Input
                    value={profileData.specialty}
                    onChange={(e) => setProfileData(s => ({ ...s, specialty: e.target.value }))}
                    placeholder="ALTA PERFORMANCE & TREINAMENTO DE FORÇA"
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 relative z-10">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">SOBRE MIM</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(s => ({ ...s, bio: e.target.value }))}
                  placeholder="Personal trainer especializado em treinamento de força e alta performance com mais de 8 anos de experiência prática..."
                  className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-sm min-h-[120px] resize-none"
                />
              </div>

              {/* Education */}
              <div className="space-y-2 relative z-10">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">FORMAÇÃO ACADÊMICA & CERTIFICAÇÕES</Label>
                <Textarea
                  value={profileData.education}
                  onChange={(e) => setProfileData(s => ({ ...s, education: e.target.value }))}
                  placeholder="Graduação em Ed. Física, Pós em Fisiologia, Certificações..."
                  className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-sm min-h-[100px] resize-none"
                />
              </div>

              <Button onClick={handleSaveProfile} className="btn-athletic h-14 w-full justify-center text-sm gap-2 uppercase tracking-widest font-black italic">
                <Save size={18} /> SALVAR ALTERAÇÕES
              </Button>
            </div>

            {/* Social Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 space-y-6">
                <h3 className="font-display font-black italic uppercase text-sm tracking-tight">
                  REDES <span className="text-primary">SOCIAIS</span>
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Instagram size={12} /> INSTAGRAM
                    </Label>
                    <Input
                      value={profileData.instagram}
                      onChange={(e) => setProfileData(s => ({ ...s, instagram: e.target.value }))}
                      placeholder="@SEUINSTAGRAM"
                      className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Link2 size={12} /> WEBSITE
                    </Label>
                    <Input
                      value={profileData.website}
                      onChange={(e) => setProfileData(s => ({ ...s, website: e.target.value }))}
                      placeholder="WWW.SEUSITE.COM.BR"
                      className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Music size={12} /> SPOTIFY PLAYLIST
                    </Label>
                    <Input
                      value={profileData.spotify_playlist_url}
                      onChange={(e) => setProfileData(s => ({ ...s, spotify_playlist_url: e.target.value }))}
                      placeholder="HTTPS://OPEN.SPOTIFY.COM/PLAYLIST/..."
                      className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-10 text-xs text-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- BRANDING --- */}
        <TabsContent value="branding" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Identidade Visual */}
            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display font-black italic uppercase text-lg tracking-tight">
                  IDENTIDADE <span className="text-primary">VISUAL</span>
                </h3>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                  PERSONALIZAÇÃO DE ALTA PERFORMANCE
                </p>
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">LOGO DA PLATAFORMA</Label>
                <div
                  onClick={() => !logoUploading && logoInputRef.current?.click()}
                  className={`border border-dashed border-white/20 bg-black/50 p-8 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-primary/50 transition-all min-h-[180px] relative ${logoUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="file"
                    ref={logoInputRef}
                    className="hidden"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                  />

                  {logoUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={24} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">ENVIANDO...</span>
                    </div>
                  ) : tenant?.logo_url ? (
                    <div className="w-full h-full relative group/image p-4">
                      <img
                        src={tenant.logo_url}
                        alt="Logo da Plataforma"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-white/60 tracking-widest">CLIQUE PARA TROCAR</span>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 gap-2 uppercase font-bold text-[10px] tracking-widest"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveLogo();
                          }}
                        >
                          <Trash2 size={14} /> REMOVER LOGO
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 border border-dashed border-white/20 flex items-center justify-center">
                        <Upload size={20} className="text-white/20 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">UPLOAD MASTER LOGO</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">PNG OU SVG - RECOMENDADO: 300X300PX</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">COR PRIMÁRIA</Label>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-3">
                    <Input
                      type="color"
                      value={brandSettings.primary_color}
                      onChange={(e) => setBrandSettings(s => ({ ...s, primary_color: e.target.value }))}
                      className="w-10 h-10 p-0 border-0 cursor-pointer rounded-none"
                    />
                    <span className="font-display font-bold italic text-sm uppercase">{brandSettings.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">COR SECUNDÁRIA</Label>
                  <div className="flex items-center gap-3 bg-black/50 border border-white/10 p-3">
                    <Input
                      type="color"
                      value={brandSettings.secondary_color}
                      onChange={(e) => setBrandSettings(s => ({ ...s, secondary_color: e.target.value }))}
                      className="w-10 h-10 p-0 border-0 cursor-pointer rounded-none"
                    />
                    <span className="font-display font-bold italic text-sm uppercase">{brandSettings.secondary_color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Domínio Especializado */}
            <div className="bg-white/5 border border-white/10 p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-display font-black italic uppercase text-lg tracking-tight">
                  DOMÍNIO <span className="text-primary">ESPECIALIZADO</span>
                </h3>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                  ENDEREÇO DE MARCA ÚNICO
                </p>
              </div>

              {/* Platform Name */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">NOME DA PLATAFORMA</Label>
                <Input
                  value={brandSettings.business_name}
                  onChange={(e) => setBrandSettings(s => ({ ...s, business_name: e.target.value }))}
                  placeholder="APEX PROTOCOL"
                  className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                />
              </div>

              {/* URL do Protocolo */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">URL DO PROTOCOLO</Label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-black/30 px-3 py-3 border border-white/10">AUTO</span>
                  <Input
                    value={tenant?.subdomain || 'suamarca'}
                    readOnly
                    className="flex-1 bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">.FIT</span>
                </div>
              </div>

              {/* Enterprise Access */}
              <div className="border border-primary/30 bg-primary/5 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-display font-black italic uppercase text-sm">ACESSO ENTERPRISE</h4>
                    <p className="text-[8px] text-white/40 uppercase tracking-widest">LIBERA DOMÍNIOS PERSONALIZADOS</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-none font-display font-black italic uppercase text-[10px] border-primary text-primary hover:bg-primary hover:text-black">
                    VER PLANOS
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <Button
              onClick={handleSaveBrand}
              disabled={updateTenantMutation.isPending}
              className="btn-athletic h-14 w-full max-w-md justify-center text-sm gap-2 uppercase tracking-widest font-black italic"
            >
              {updateTenantMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
              SALVAR ALTERAÇÕES
            </Button>
          </div>
        </TabsContent>

        {/* --- VOCABULÁRIO --- */}
        <TabsContent value="vocabulary" className="mt-0 outline-none">
          <div className="max-w-4xl bg-white/5 border border-white/10 p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl" />

            <div className="space-y-2">
              <h3 className="font-display font-black italic uppercase text-lg tracking-tight">
                PERSONALIZAÇÃO DE <span className="text-primary">VOCABULÁRIO</span>
              </h3>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                ESCOLHA COMO CADA SEÇÃO SERÁ EXIBIDA PARA SEUS ALUNOS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              {[
                { key: 'training', label: 'TREINAMENTO', default: 'Treino' },
                { key: 'nutrition', label: 'DIETA & NUTRIÇÃO', default: 'Dieta' },
                { key: 'protocols', label: 'PROTOCOLOS', default: 'Protocolos' },
                { key: 'progress', label: 'EVOLUÇÃO', default: 'Evolução' },
                { key: 'appointments', label: 'AGENDA', default: 'Agenda' },
                { key: 'messages', label: 'CHAT / MENSAGENS', default: 'Chat' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</Label>
                  <Input
                    value={terminology[item.key] || item.default}
                    onChange={(e) => setTerminology(prev => ({ ...prev, [item.key]: e.target.value }))}
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleSaveBrand} className="btn-athletic h-14 w-full justify-center text-sm gap-2 uppercase tracking-widest font-black italic">
              <Save size={18} /> SALVAR VOCABULÁRIO
            </Button>
          </div>
        </TabsContent>

        {/* --- PÁGINA PÚBLICA --- */}
        <TabsContent value="public-page" className="mt-0 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-8 space-y-8 relative overflow-hidden">
              <div className="space-y-2">
                <h3 className="font-display font-black italic uppercase text-lg tracking-tight">
                  PÁGINA <span className="text-primary">PUBLICA DO COACH</span>
                </h3>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                  CONFIGURE SUA LANDING PAGE DE CAPTAÇÃO E APRESENTAÇÃO.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">SLUG DA URL (LINK ÚNICO)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 bg-black/30 px-3 py-3 border border-white/10">APEXPRO.FIT/</span>
                    <Input
                      value={brandSettings.slug}
                      onChange={(e) => setBrandSettings(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      placeholder="seu-nome-pro"
                      className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">TÍTULO HERÓI (CTA PRINCIPAL)</Label>
                  <Input
                    value={landingConfig.hero_title}
                    onChange={(e) => setLandingConfig(s => ({ ...s, hero_title: e.target.value }))}
                    placeholder="ALCANCE O PRÓXIMO NÍVEL DO SEU SHAPE"
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">SUBTÍTULO HERÓI</Label>
                  <Input
                    value={landingConfig.hero_subtitle}
                    onChange={(e) => setLandingConfig(s => ({ ...s, hero_subtitle: e.target.value }))}
                    placeholder="Consultoria online focada em resultados reais e performance de elite."
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic h-12 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40">SOBRE O COACH (LANDING PAGE)</Label>
                  <Textarea
                    value={landingConfig.about_text}
                    onChange={(e) => setLandingConfig(s => ({ ...s, about_text: e.target.value }))}
                    placeholder="Conte sua história e metodologia para novos alunos..."
                    className="bg-black/50 border-white/10 rounded-none font-display font-bold italic text-sm min-h-[150px] resize-none"
                  />
                </div>
              </div>

              <Button onClick={handleSaveBrand} className="btn-athletic h-14 w-full justify-center text-sm gap-2 uppercase tracking-widest font-black italic">
                <Save size={18} /> SALVAR PÁGINA PÚBLICA
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 p-6 space-y-4">
                <h4 className="font-display font-black italic uppercase text-xs tracking-tight">PREVIEW <span className="text-primary text-glow-primary">LIVE</span></h4>
                <div className="aspect-[9/16] bg-black border border-white/10 overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  {tenant?.logo_url && (
                    <img src={tenant.logo_url} className="absolute top-8 left-1/2 -translate-x-1/2 w-20 z-20 brightness-200" alt="Logo" />
                  )}
                  <div className="absolute bottom-8 left-4 right-4 z-20 space-y-2">
                    <p className="font-display font-black italic text-xl uppercase leading-none tracking-tighter truncate">
                      {landingConfig.hero_title || 'SEU TÍTULO AQUI'}
                    </p>
                    <p className="text-[8px] uppercase tracking-widest text-white/60 line-clamp-2">
                      {landingConfig.hero_subtitle || 'Configuração de subtítulo para sua landing page.'}
                    </p>
                    <div className="h-8 bg-primary w-full mt-4 flex items-center justify-center">
                      <span className="text-black font-black italic text-[8px] uppercase tracking-tighter">QUERO COMEÇAR AGORA</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  VISUALIZAÇÃO EM TEMPO REAL
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* --- ASSINATURA --- */}
        <TabsContent value="assinatura" className="mt-0 outline-none">
          <SubscriptionManager compact />
        </TabsContent>

        {/* --- ALERTAS (Placeholder) --- */}
        <TabsContent value="alertas" className="mt-0 outline-none">
          <div className="max-w-2xl bg-white/5 border border-white/10 p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="font-display font-black italic uppercase text-lg tracking-tight flex items-center gap-2">
                <Bell className="text-primary" size={20} /> CENTRAL DE <span className="text-primary text-glow-primary">ALERTAS</span>
              </h3>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                CONFIGURE NOTIFICAÇÕES E ALERTAS DO SISTEMA.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={48} className="text-white/10 mb-4" />
              <p className="text-white/40 font-display font-bold uppercase text-sm tracking-widest">EM BREVE</p>
              <p className="text-white/20 text-[10px] uppercase tracking-widest mt-2">
                NOTIFICAÇÕES PUSH, EMAIL, WHATSAPP
              </p>
            </div>
          </div>
        </TabsContent>

        {/* --- EQUIPE --- */}
        <TabsContent value="equipe" className="mt-0 outline-none">
          <div className="max-w-3xl space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-4">
                <h3 className="font-display font-black italic uppercase text-lg tracking-tight flex items-center gap-2">
                  <Users className="text-primary" size={20} /> STAFF <span className="text-primary text-glow-primary">TÉCNICO</span>
                </h3>
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                  CO-AUTORES E COLABORADORES DA SUA CONSULTORIA.
                </p>
              </div>
              <InviteCoachDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team?.map(coach => (
                <div key={coach.id} className="bg-white/5 border border-white/10 p-6 flex items-center gap-4 group hover:border-primary/50 transition-all">
                  <div className="w-12 h-12 bg-black flex items-center justify-center -skew-x-12 border border-white/10">
                    <User size={20} className="text-white/20" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-black italic uppercase text-sm tracking-tight">{coach.full_name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">COACH @ {tenant?.business_name || 'CONSULTORIA'}</span>
                    </div>
                  </div>
                  {coach.id === profile?.id && (
                    <Badge className="bg-primary/20 text-primary border-primary/20 rounded-none font-display font-black italic uppercase text-[7px]">VOCÊ</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default SettingsPage;
