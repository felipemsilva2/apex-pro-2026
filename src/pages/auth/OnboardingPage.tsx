import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShieldCheck, User, LogOut } from "lucide-react";

export default function OnboardingPage() {
    const { user, profile, refetchProfile, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        cref: "",
        bio: "",
        specialty: ""
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || "",
                cref: profile.cref || "",
                bio: profile.bio || "",
                specialty: profile.specialty || ""
            });
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    cref: formData.cref,
                    bio: formData.bio,
                    specialty: formData.specialty
                })
                .eq('id', user.id);

            if (error) throw error;

            toast.success("Perfil ativado com sucesso!");
            await refetchProfile(user.id);
            navigate("/dashboard");
        } catch (error: any) {
            toast.error("Erro ao salvar perfil", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-6 relative overflow-hidden">
            {/* Background Kinetic decoration */}
            <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />

            <div className="w-full max-w-[520px] relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 group mb-8">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center -skew-x-12">
                            <span className="text-black font-display font-black text-2xl italic leading-none">A</span>
                        </div>
                        <span className="font-display font-black text-3xl text-white italic uppercase tracking-tighter">
                            APEX<span className="text-primary text-blur-sm">PRO</span>
                        </span>
                    </div>

                    <h1 className="text-3xl font-display font-black italic uppercase text-white leading-none tracking-tighter mb-3">
                        ATIVAÇÃO DO <span className="text-primary">PERFIL</span>
                    </h1>
                    <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                        Configure seu perfil profissional
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6 bg-white/5 border border-white/10 p-8 shadow-2xl relative">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome Completo</Label>
                            <Input
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                required
                                className="bg-black/50 border-white/10 text-white font-display font-bold italic h-12"
                                placeholder="SEU NOME"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Credencial (CREF/CRN)</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={16} />
                                    <Input
                                        value={formData.cref}
                                        onChange={e => setFormData({ ...formData, cref: e.target.value })}
                                        required
                                        className="pl-10 bg-black/50 border-white/10 text-white font-display font-bold italic h-12 border-primary/20 focus:border-primary"
                                        placeholder="000000-G/SP"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Especialidade</Label>
                                <Input
                                    value={formData.specialty}
                                    onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                                    className="bg-black/50 border-white/10 text-white font-display font-bold italic h-12"
                                    placeholder="HIPERTROFIA"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Bio Profissional</Label>
                            <Textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                className="bg-black/50 border-white/10 text-white min-h-[100px]"
                                placeholder="Descreva sua experiência e metodologia..."
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-athletic h-14 text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                        ATIVAR DASHBOARD
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={signOut}
                        className="text-white/20 hover:text-white flex items-center justify-center gap-2 mx-auto text-xs uppercase tracking-widest transition-colors"
                    >
                        <LogOut size={14} /> Sair do Sistema
                    </button>
                </div>
            </div>
        </div>
    );
}
