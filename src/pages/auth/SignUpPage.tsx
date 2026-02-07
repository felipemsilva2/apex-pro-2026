import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { TenantService } from "@/api/services/tenantService";
import { Loader2, User, Mail, Lock, ShieldCheck, Dumbbell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignUpPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const initialEmail = searchParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [role, setRole] = useState<'coach' | 'client'>('coach');
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Strict Flow Redirection: If no token, redirect to unified checkout (public signup is disabled)
    useEffect(() => {
        if (!token) {
            navigate("/checkout", { replace: true });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token) {
            const validateInvite = async () => {
                try {
                    const { data, error } = await supabase
                        .from('invitations')
                        .select('role, tenant_id')
                        .eq('token', token)
                        .single();

                    if (data) {
                        setRole(data.role as 'coach' | 'client');
                        setTenantId(data.tenant_id);
                    }
                } catch (err) {
                    console.error("Error validating invite:", err);
                }
            };
            validateInvite();
        }
    }, [token]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!termsAccepted) {
            toast.error("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
            return;
        }

        setLoading(true);

        try {
            const isManaged = !email.includes('@');

            if (isManaged) {
                // If no token and no tenantId, this is a new professional creating a tenant
                if (!token && !tenantId) {
                    if (!businessName) throw new Error("Nome da Empresa/Marca é obrigatório.");

                    const result = await TenantService.createTenant({
                        fullName,
                        username: email.trim().toLowerCase(),
                        password,
                        businessName
                    });

                    if (result.error) throw new Error(result.error);

                    toast.success("Ambiente criado com sucesso!", {
                        description: `Seu usuário de acesso é "${email}". Faça login para configurar sua marca.`
                    });
                    navigate("/login", { state: { newUser: true } });
                    return;
                }

                // Existing managed account flow (invitations)
                if (!tenantId) {
                    throw new Error("ID do Tenant ou Convite é necessário para cadastro via usuário.");
                }

                const service = new TenantService(tenantId || "");
                const result = await service.manageAthlete({
                    fullName,
                    username: email.trim().toLowerCase(),
                    password,
                    tenantId: tenantId || "",
                    role: role
                });

                if (result.error) throw new Error(result.error);

                toast.success("Conta criada com sucesso!", {
                    description: `Seu usuário de acesso é "${email}". Faça login para começar.`
                });
                navigate("/login");
                return;
            }

            // Standard flow for email accounts
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        invitation_token: token,
                        role: role,
                        tenant_id: tenantId
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                toast.success("Conta criada! Verifique seu e-mail para confirmar.");
                navigate("/login", { state: { newUser: true } });
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            const errorMessage = error.message?.toLowerCase() || "";
            if (
                errorMessage.includes("already registered") ||
                errorMessage.includes("unique constraint") ||
                errorMessage.includes("user_already_exists")
            ) {
                toast.error("Este usuário/e-mail já possui cadastro.", {
                    description: "Por favor, faça login para acessar sua conta.",
                    action: {
                        label: "Ir para Login",
                        onClick: () => navigate("/login")
                    },
                    duration: 8000
                });
            } else {
                toast.error("Erro ao criar conta", {
                    description: error.message || "Tente novamente.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-6 relative overflow-hidden">
            <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />

            <div className="w-full max-w-[480px] relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-3 group mb-6">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center -skew-x-12 group-hover:scale-110 transition-transform">
                            <Dumbbell className="text-black" size={24} />
                        </div>
                        <span className="font-display font-black text-3xl text-white italic uppercase tracking-tighter">
                            APEX<span className="text-primary text-blur-sm">PRO</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-display font-black italic uppercase text-white leading-none tracking-tighter mb-3">
                        SOLICITAR <span className="text-primary">ACESSO</span>
                    </h1>
                    {token ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 mt-2">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">CONVITE ATIVO</span>
                        </div>
                    ) : (
                        <p className="text-white/40 font-display font-bold uppercase italic text-[10px] tracking-[0.3em]">
                            Acesso à Plataforma
                        </p>
                    )}
                </div>

                <form onSubmit={handleSignUp} className="space-y-5 bg-white/5 border border-white/10 p-8 shadow-2xl relative">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome Completo</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                            <Input
                                placeholder="SEU NOME"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">E-mail ou Usuário</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                            <Input
                                type="text"
                                placeholder="NOME@EXEMPLO.COM OU USUARIO"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={!!token && !!initialEmail}
                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all text-white disabled:opacity-50"
                            />
                            <p className="mt-2 text-[9px] font-bold text-primary/60 uppercase tracking-widest italic leading-relaxed">
                                💡 Dica: Use seu "primeiro e segundo nome" como usuário (ex: felipemsilva), como no Instagram. É mais fácil e profissional!
                            </p>
                        </div>
                    </div>

                    {!token && !tenantId && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Nome da sua Marca/Empresa</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                                <Input
                                    placeholder="EX: APEX PRO, STUDIO FIT"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    required
                                    className="pl-12 h-14 bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all text-white"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Senha</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-12 h-14 bg-black/50 border-white/10 rounded-none font-display font-bold italic text-xs tracking-widest focus:border-primary transition-all text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                            id="terms"
                            checked={termsAccepted}
                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                            className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="terms"
                                className="text-[10px] font-bold uppercase italic tracking-widest text-white/50 leading-relaxed cursor-pointer select-none"
                            >
                                Li e aceito os{" "}
                                <Link to="/terms" target="_blank" className="text-primary/80 hover:text-primary underline underline-offset-2">Termos de Uso</Link>
                                {" "}e a{" "}
                                <Link to="/privacy" target="_blank" className="text-primary/80 hover:text-primary underline underline-offset-2">Política de Privacidade</Link>
                                .
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !termsAccepted}
                        className="w-full btn-athletic h-14 group text-base mt-2 disabled:opacity-30 disabled:grayscale"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <span>CRIAR MINHA CONTA</span>
                        )}
                    </Button>

                    <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pt-4">
                        Já possui credenciais? <Link to="/login" className="text-primary/60 hover:text-primary transition-colors">Fazer Login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
