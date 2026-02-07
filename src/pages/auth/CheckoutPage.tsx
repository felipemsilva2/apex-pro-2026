import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    Loader2,
    User,
    Mail,
    Lock,
    ShieldCheck,
    Dumbbell,
    CreditCard,
    QrCode,
    ArrowRight,
    Check,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const CheckoutPage = () => {
    const [searchParams] = useSearchParams();
    const initialPlan = (searchParams.get("plan")?.toUpperCase() || "MENSAL") as "MENSAL" | "ANUAL";

    const [loading, setLoading] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<"MENSAL" | "ANUAL">(initialPlan);
    const [paymentMethod, setPaymentMethod] = useState<"CREDIT_CARD" | "PIX">("CREDIT_CARD");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const navigate = useNavigate();

    // Account Data
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [password, setPassword] = useState("");

    // Payment Data
    const [cpfCnpj, setCpfCnpj] = useState("");
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const getFriendlyError = (message: string) => {
        const lowerMessage = message.toLowerCase();

        // Log technical error for developers (visible in console)
        console.error("Technical Error Detail:", message);

        if (lowerMessage.includes("asaas customer")) {
            if (lowerMessage.includes("cpf") || lowerMessage.includes("documento")) return "O CPF/CNPJ informado é inválido ou já está em uso.";
            if (lowerMessage.includes("email")) return "O e-mail informado é inválido ou já possui cadastro.";
            return "Houve um problema ao validar seus dados com o Asaas. Verifique suas informações.";
        }

        if (lowerMessage.includes("asaas sub") || lowerMessage.includes("asaas payment")) {
            if (lowerMessage.includes("billingtype")) return "Este método de pagamento não está disponível no momento.";
            if (lowerMessage.includes("creditcard")) return "O cartão foi recusado ou os dados estão incorretos.";
            if (lowerMessage.includes("aprovada") || lowerMessage.includes("pago")) return "Sua conta do Asaas ainda não está pronta para processar este pagamento.";
            return "Não conseguimos processar o pagamento. Verifique os dados do cartão ou tente Pix.";
        }

        if (lowerMessage.includes("duplicada") || lowerMessage.includes("already exists")) {
            return "Este usuário ou subdomínio já está sendo utilizado.";
        }

        if (lowerMessage.includes("network") || lowerMessage.includes("fetch")) {
            return "Erro de conexão. Verifique sua internet e tente novamente.";
        }

        return "Ocorreu um erro inesperado ao ativar sua conta. Nossa equipe técnica já foi notificada.";
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!termsAccepted) {
            toast.error("Termos de Uso", { description: "Você precisa aceitar os termos para continuar." });
            return;
        }

        if (!fullName || !businessName || !email || !password) {
            toast.error("Campos Incompletos", { description: "Pelo menos um campo obrigatório está vazio." });
            return;
        }

        if (!cpfCnpj || cpfCnpj.length < 11) {
            toast.error("Documento Inválido", { description: "O CPF ou CNPJ informado não parece estar correto." });
            return;
        }

        if (paymentMethod === 'CREDIT_CARD') {
            if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                toast.error("Dados do Cartão", { description: "Preencha todos os campos do seu cartão de crédito." });
                return;
            }
        }

        setLoading(true);

        try {
            // Call Atomic Onboarding Edge Function
            const { data, error } = await supabase.functions.invoke('complete-onboarding', {
                body: {
                    account: {
                        fullName,
                        email,
                        password,
                        businessName
                    },
                    payment: {
                        paymentMethod,
                        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                        creditCard: paymentMethod === 'CREDIT_CARD' ? {
                            holderName: cardDetails.name,
                            number: cardDetails.number.replace(/\s/g, ''),
                            expiryMonth: cardDetails.expiry.split('/')[0],
                            expiryYear: '20' + cardDetails.expiry.split('/')[1],
                            ccv: cardDetails.cvv
                        } : null,
                        holderInfo: paymentMethod === 'CREDIT_CARD' ? {
                            name: cardDetails.name,
                            email: email.includes('@') ? email : `${email.toLowerCase().trim()}@managed.nutripro.pro`,
                            cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                            postalCode: '00000000', // Placeholder as required by Asaas
                            addressNumber: '0',
                            phone: '0000000000'
                        } : null
                    },
                    plan: {
                        cycle: selectedCycle
                    }
                }
            });

            if (error) {
                // Supabase error (like network or edge function crash)
                throw new Error(error.message || "Erro na Edge Function");
            }

            if (data?.error) {
                // Custom error returned by our Edge Function logic
                throw new Error(data.error);
            }

            toast.success("Ecosistema Ativado", {
                description: "Sua conta foi criada e o plano configurado. Bem-vindo!"
            });

            // Auto-login logic
            const identification = email.includes('@') ? email.trim() : `${email.trim().toLowerCase()}@managed.nutripro.pro`;
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: identification,
                password
            });

            if (loginError) {
                console.error("Auto-login failed:", loginError);
                navigate('/login', { state: { email, message: "Conta criada! Por favor, faça login manualmente." } });
                return;
            }

            navigate('/dashboard');

        } catch (error: any) {
            const friendlyMessage = getFriendlyError(error.message);
            toast.error("Não foi possível concluir", {
                description: friendlyMessage,
                duration: 6000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-6 lg:p-12 relative overflow-hidden">
            {/* Kinetic Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4FF00]/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4FF00]/10 blur-[120px] rounded-full" />
                <div className="scanline" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Account & Logo */}
                    <div className="flex-1 space-y-8 animate-in slide-in-from-left-4 duration-700">
                        <Link to="/" className="inline-flex items-center gap-3 group mb-4">
                            <div className="w-12 h-12 bg-primary flex items-center justify-center -skew-x-12 group-hover:scale-110 transition-transform">
                                <Dumbbell className="text-black" size={24} />
                            </div>
                            <span className="font-display font-black text-3xl text-white italic uppercase tracking-tighter">
                                APEX<span className="text-primary text-blur-sm">PRO</span>
                            </span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-6xl font-display font-black italic uppercase leading-none tracking-tighter">
                                ATIVAR <span className="text-primary">ECOSSISTEMA</span>
                            </h1>
                            <p className="text-white/40 font-display font-bold uppercase italic text-xs tracking-widest">
                                Complete seu cadastro e comece a escalar agora.
                            </p>
                        </div>

                        <div className="athletic-card p-8 bg-zinc-900/40 border border-white/5 space-y-6 backdrop-blur-sm relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <User size={100} />
                            </div>

                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic mb-4 flex items-center gap-2">
                                <Check size={14} />
                                1. DADOS DA CONTA
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 italic">Nome Profissional</Label>
                                    <Input
                                        placeholder="EX: FELIPE SILVA"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        className="bg-black/40 border-white/10 h-14 font-display font-bold italic text-xs tracking-widest uppercase rounded-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 italic">Nome da sua Marca</Label>
                                    <Input
                                        placeholder="EX: APEX ELITE"
                                        value={businessName}
                                        onChange={e => setBusinessName(e.target.value)}
                                        className="bg-black/40 border-white/10 h-14 font-display font-bold italic text-xs tracking-widest uppercase rounded-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 relative z-10">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 italic">Usuário de Acesso (Dê preferência ao Nome)</Label>
                                <Input
                                    placeholder=" EX: FELIPESILVA"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-black/40 border-white/10 h-14 font-display font-bold italic text-xs tracking-widest uppercase rounded-none focus:border-primary transition-all"
                                />
                                <div className="p-3 bg-primary/5 border border-primary/20 mt-2">
                                    <p className="text-[9px] font-bold text-primary italic uppercase tracking-widest leading-relaxed">
                                        🚀 Dica Pro: Use seu "Nome e Segundo Nome" (ex: marcosfit), como no Instagram. É muito mais prático!
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 relative z-10">
                                <Label className="text-[9px] font-bold uppercase tracking-widest text-white/40 italic">Senha de Segurança</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="bg-black/40 border-white/10 h-14 pl-12 font-display font-bold italic text-xs tracking-widest rounded-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <div className="p-5 border border-white/5 bg-white/2 space-y-3">
                                <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
                                    <Check className="text-primary" size={16} />
                                </div>
                                <p className="text-[10px] font-bold uppercase italic text-white/40 leading-relaxed tracking-wider">
                                    Cancelamento instantâneo sem multas ou pegadinhas.
                                </p>
                            </div>
                            <div className="p-5 border border-white/5 bg-white/2 space-y-3">
                                <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
                                    <ShieldCheck className="text-primary" size={16} />
                                </div>
                                <p className="text-[10px] font-bold uppercase italic text-white/40 leading-relaxed tracking-wider">
                                    Pagamentos processados via infraestrutura Asaas IP S.A.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Plan & Payment */}
                    <div className="w-full lg:w-[460px] space-y-8 animate-in slide-in-from-right-4 duration-700">
                        <div className="bg-[#0c0c0d] border-2 border-primary/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                            <div className="absolute -top-4 right-4 px-4 py-2 bg-primary text-black font-display font-black italic text-[10px] uppercase tracking-widest -skew-x-12 z-20">
                                AMBIENTE PROTEGIDO
                            </div>

                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic mb-6 flex items-center gap-2">
                                <CreditCard size={14} />
                                2. PLANO & PAGAMENTO
                            </h2>

                            {/* Cycle Toggle */}
                            <div className="flex gap-2 p-1 bg-white/5 border border-white/5 w-full mb-8">
                                <button
                                    onClick={() => setSelectedCycle('MENSAL')}
                                    className={cn(
                                        "flex-1 py-3 font-display font-black italic text-[11px] uppercase tracking-widest transition-all",
                                        selectedCycle === 'MENSAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setSelectedCycle('ANUAL')}
                                    className={cn(
                                        "flex-1 py-3 font-display font-black italic text-[11px] uppercase tracking-widest transition-all",
                                        selectedCycle === 'ANUAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    Anual (-20%)
                                </button>
                            </div>

                            {/* Plan Summary */}
                            <div className="mb-8 border-y border-white/5 py-8 flex items-center justify-between gap-4 min-h-[100px]">
                                <div className="space-y-1.5 flex-1">
                                    <span className="font-display font-black italic text-white uppercase text-xl leading-none tracking-tight block">TOTAL AGORA</span>
                                    {paymentMethod === 'CREDIT_CARD' ? (
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-primary italic uppercase tracking-widest">30 DIAS DE TESTE ATIVADOS</p>
                                            <p className="text-[10px] font-black text-white/40 italic uppercase tracking-tighter leading-tight">
                                                APÓS O TESTE: <span className="text-white">R$ {selectedCycle === 'MENSAL' ? '39,90 / MÊS' : '382,80 / ANO'}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-red-500 italic uppercase tracking-widest animate-pulse">PAGAMENTO IMEDIATO</p>
                                            <p className="text-[10px] font-black text-white/40 italic uppercase tracking-tighter leading-tight">
                                                RENOVAÇÃO: <span className="text-white">{selectedCycle === 'MENSAL' ? 'MENSAL' : 'ANUAL'}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-baseline justify-end gap-1">
                                        <span className="text-xl font-display font-black italic text-primary">R$</span>
                                        <span className="text-5xl lg:text-6xl font-display font-black italic text-white leading-none tracking-tighter">
                                            {paymentMethod === 'CREDIT_CARD' ? '0,00' : (selectedCycle === 'MENSAL' ? '39,90' : '382,80')}
                                        </span>
                                    </div>
                                    {paymentMethod === 'CREDIT_CARD' && (
                                        <p className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em] mt-2 italic">
                                            PRIMEIRA COBRANÇA EM 31 DIAS
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method Switcher */}
                            <div className="flex gap-2 mb-8">
                                <button
                                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                                    className={cn(
                                        "flex-1 h-14 border transition-all flex items-center justify-center gap-3 font-display font-bold italic text-[11px] uppercase tracking-widest",
                                        paymentMethod === 'CREDIT_CARD' ? "bg-white text-black border-white" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <CreditCard size={16} />
                                    Cartão
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('PIX')}
                                    className={cn(
                                        "flex-1 h-14 border transition-all flex items-center justify-center gap-3 font-display font-bold italic text-[11px] uppercase tracking-widest",
                                        paymentMethod === 'PIX' ? "bg-white text-black border-white" : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                                    )}
                                >
                                    <QrCode size={16} />
                                    Pix
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">CPF / CNPJ do Titular</Label>
                                    <Input
                                        placeholder="000.000.000-00"
                                        value={cpfCnpj}
                                        onChange={e => setCpfCnpj(e.target.value)}
                                        className="bg-black border-white/10 h-14 font-display font-bold text-xs tracking-[0.2em] rounded-none focus:border-primary transition-all"
                                    />
                                </div>

                                {paymentMethod === 'CREDIT_CARD' ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">Número do Cartão</Label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                                <Input
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardDetails.number}
                                                    onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                    className="bg-black border-white/10 h-14 pl-12 font-display font-bold text-xs tracking-[0.2em] rounded-none focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">Validade</Label>
                                                <Input
                                                    placeholder="MM / AA"
                                                    value={cardDetails.expiry}
                                                    onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                    className="bg-black border-white/10 h-14 font-display font-bold text-xs tracking-[0.2em] rounded-none focus:border-primary transition-all text-center"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">CVV</Label>
                                                <Input
                                                    placeholder="123"
                                                    value={cardDetails.cvv}
                                                    onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                    className="bg-black border-white/10 h-14 font-display font-bold text-xs tracking-[0.2em] rounded-none focus:border-primary transition-all text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 border border-amber-500/20 bg-amber-500/5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <ShieldAlert size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                                        <p className="text-[10px] font-bold text-amber-500/80 uppercase italic tracking-widest leading-relaxed">
                                            O Pix não oferece período de teste. Seu QR Code será gerado após clicar em concluir.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start space-x-3 pt-10">
                                <Checkbox
                                    id="terms"
                                    checked={termsAccepted}
                                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                    className="mt-1 border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                                />
                                <label htmlFor="terms" className="text-[10px] font-bold uppercase italic tracking-widest text-white/30 leading-relaxed cursor-pointer select-none">
                                    Concordo com os <Link to="/terms" target="_blank" className="text-primary/60 hover:text-primary transition-colors">Termos</Link> e <Link to="/privacy" target="_blank" className="text-primary/60 hover:text-primary transition-colors">Privacidade</Link>.
                                </label>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                disabled={loading || !termsAccepted}
                                className="w-full btn-athletic h-20 group text-lg mt-8 shadow-[0_15px_40px_rgba(var(--primary-rgb),0.3)] hover:shadow-primary/50 transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-black" size={24} />
                                ) : (
                                    <>
                                        ATIVAR MINHA LICENÇA AGORA
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform" size={24} />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-4">
                            <ShieldCheck className="text-white/20" size={14} />
                            <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em] text-center">
                                APEX PRO ECOSYSTEM // ENCRYPTED GATEWAY
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
