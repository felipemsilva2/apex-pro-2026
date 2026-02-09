import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Dumbbell } from "lucide-react";

const REMEMBER_KEY = "apex_remember_login";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/dashboard";
    const isNewUser = location.state?.newUser;

    // Determine greeting
    const [hasRemembered, setHasRemembered] = useState(false);

    useEffect(() => {
        setHasRemembered(!!localStorage.getItem(REMEMBER_KEY));
    }, []);

    const greeting = isNewUser
        ? { first: "BEM-VINDO AO ", second: "TIME" }
        : hasRemembered
            ? { first: "BEM-VINDO ", second: "DE VOLTA" }
            : { first: "ACESSE SUA ", second: "CONTA" };

    // Load remembered login on mount
    useEffect(() => {
        const remembered = localStorage.getItem(REMEMBER_KEY);
        if (remembered) {
            try {
                const { email: savedEmail } = JSON.parse(remembered);
                setEmail(savedEmail);
                setRememberMe(true);
            } catch (e) {
                localStorage.removeItem(REMEMBER_KEY);
            }
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const identification = email.includes('@')
                ? email.trim()
                : `${email.trim().toLowerCase()}@acesso.apexpro.fit`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: identification,
                password,
            });

            if (error) throw error;

            // Handle remember me
            if (rememberMe) {
                localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: email.trim() }));
            } else {
                localStorage.removeItem(REMEMBER_KEY);
            }

            // Check user role to determine redirect destination
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            toast.success("Login realizado com sucesso!");

            // Redirect based on role
            if (profile?.role === 'admin') {
                toast.info("Bem-vindo ao Painel Administrativo!", {
                    description: "Redirecionando para o HQ..."
                });
                navigate('/hq', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (error: any) {
            toast.error("Erro ao entrar", {
                description: error.message || "Verifique suas credenciais.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0B] p-6 relative overflow-hidden">
            {/* Background Kinetic decoration */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="w-full max-w-[440px] relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-3 group mb-8">
                        <div className="w-12 h-12 bg-primary flex items-center justify-center -skew-x-12 group-hover:scale-110 transition-transform">
                            <Dumbbell className="text-black" size={24} />
                        </div>
                        <span className="font-display font-black text-3xl text-white italic uppercase tracking-tighter">
                            APEX<span className="text-primary text-blur-sm">PRO</span>
                        </span>
                    </Link>
                    <h1 className="text-3xl font-display font-black italic text-white leading-none tracking-tight mb-3 uppercase">
                        {greeting.first} <span className="text-primary">{greeting.second}</span>
                    </h1>
                    <p className="text-white/40 text-sm">
                        Entre na sua conta para continuar
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 bg-white/5 border border-white/10 p-8 shadow-2xl relative rounded-lg">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -skew-x-[30deg] translate-x-8 -translate-y-8 pointer-events-none" />

                    <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic pl-1">E-mail ou Usuário</Label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                            <Input
                                type="text"
                                placeholder="nome@exemplo.com ou usuário"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-14 h-14 bg-black/50 border-white/10 rounded-none text-sm focus:border-primary transition-all text-white placeholder:text-white/20 font-medium"
                            />
                        </div>
                        <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest italic leading-relaxed pl-1 pt-1">
                            ✨ Dica: Coaches podem entrar usando o Nome e Segundo Nome (ex: felipemsilva).
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">Senha</Label>
                            <button type="button" className="text-[10px] font-bold uppercase italic tracking-widest text-primary/60 hover:text-primary transition-colors">
                                Esqueci a senha
                            </button>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="pl-14 pr-12 h-14 bg-black/50 border-white/10 rounded-none text-sm focus:border-primary transition-all text-white placeholder:text-white/20 font-medium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-1">
                        <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                            className="border-white/20 h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-none"
                        />
                        <label
                            htmlFor="remember"
                            className="text-[11px] font-bold uppercase tracking-widest text-white/50 cursor-pointer hover:text-white/70 transition-colors italic"
                        >
                            Lembrar meu login
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-athletic h-14 group text-base"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                <span>Entrar no Sistema</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                    </Button>

                    <p className="text-center text-sm text-white/30 pt-2">
                        Ainda não tem acesso?{" "}
                        <Link to="/checkout" className="text-primary/60 hover:text-primary transition-colors">
                            Ativar Nova Licença
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
