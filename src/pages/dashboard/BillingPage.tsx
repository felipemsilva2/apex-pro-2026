import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import {
    CreditCard,
    Check,
    AlertCircle,
    Zap,
    Clock,
    ShieldCheck,
    QrCode,
    ArrowRight,
    ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BillingPage = () => {
    const { user, profile } = useAuth();
    const { tenant } = useTenant();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [selectedCycle, setSelectedCycle] = useState<'MENSAL' | 'ANUAL'>('MENSAL');
    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('CREDIT_CARD');
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [cardDetails, setCardDetails] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        loadBillingData();
    }, [tenant?.id]);

    const loadBillingData = async () => {
        if (!tenant?.id) return;
        try {
            setLoading(true);
            const { data: plansData } = await supabase.from('billing_plans').select('*').eq('active', true);
            const { data: subData } = await supabase
                .from('subscriptions')
                .select('*, plan:billing_plans(*)')
                .eq('tenant_id', tenant.id)
                .order('created_at', { ascending: false })
                .maybeSingle();

            setPlans(plansData || []);
            setSubscription(subData);
        } catch (error) {
            console.error('Error loading billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (processing) return;

        // Global Validation
        if (!cpfCnpj || cpfCnpj.length < 11) {
            toast.error("Por favor, informe um CPF/CNPJ válido.");
            return;
        }

        // Validation if Card
        if (paymentMethod === 'CREDIT_CARD') {
            if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                toast.error("Por favor, preencha todos os dados do cartão.");
                return;
            }
        }

        try {
            setProcessing(true);

            // 1. Ensure Customer exists in Asaas
            const { data: customerData, error: customerError } = await supabase.functions.invoke('asaas-manager', {
                body: {
                    action: 'create-customer',
                    payload: {
                        name: profile?.full_name || tenant?.business_name,
                        email: profile?.email || tenant?.contact_email,
                        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                        phone: profile?.phone || '0000000000'
                    }
                }
            });

            if (customerError) throw customerError;

            // 2. Prepare Credit Card holder info if needed
            let creditCardPayload = null;
            let holderInfoPayload = null;
            if (paymentMethod === 'CREDIT_CARD') {
                const [month, year] = cardDetails.expiry.split('/');
                creditCardPayload = {
                    holderName: cardDetails.name,
                    number: cardDetails.number.replace(/\s/g, ''),
                    expiryMonth: month,
                    expiryYear: '20' + year,
                    ccv: cardDetails.cvv
                };
                holderInfoPayload = {
                    name: cardDetails.name,
                    email: profile?.email || tenant?.contact_email || '',
                    cpfCnpj: cpfCnpj.replace(/\D/g, ''),
                    postalCode: '00000000', // Placeholder or collect
                    addressNumber: '0',
                    phone: profile?.phone || '0000000000'
                };
            }

            // 3. Create Subscription
            const { data: subData, error: subError } = await supabase.functions.invoke('asaas-manager', {
                body: {
                    action: 'create-subscription',
                    payload: {
                        planType: selectedCycle,
                        asaasId: customerData.asaasId,
                        creditCard: creditCardPayload,
                        holderInfo: holderInfoPayload
                    }
                }
            });

            if (subError) throw subError;

            toast.success(paymentMethod === 'CREDIT_CARD'
                ? "Assinatura ativada! Você tem 30 dias de teste grátis."
                : "Assinatura iniciada! Aguardando pagamento do Pix.");

            loadBillingData();
        } catch (error: any) {
            toast.error(`Falha ao iniciar assinatura: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <Skeleton className="h-12 w-64 bg-white/5" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96 lg:col-span-2 bg-white/5" />
                    <Skeleton className="h-96 bg-white/5" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Zap className="text-primary h-5 w-5 neon-glow" />
                        <h1 className="font-display font-black italic text-4xl lg:text-5xl uppercase tracking-tighter">
                            GERENCIAR <span className="text-primary">ASSINATURA</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 font-medium uppercase tracking-widest text-[10px]">
                        Central de cobrança e licenciamento da plataforma
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 -rotate-45 translate-x-4 -translate-y-4 group-hover:bg-primary/20 transition-colors" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Status Atual</span>
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                tenant?.subscription_status === 'active' || tenant?.subscription_status === 'trialing' ? "bg-primary neon-glow" : "bg-amber-500 animate-pulse"
                            )} />
                            <span className="font-display font-bold italic uppercase text-sm">
                                {tenant?.subscription_status === 'active' ? 'LICENÇA ATIVA' :
                                    tenant?.subscription_status === 'trialing' ? 'PERÍODO DE TESTE' : 'INATIVO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Plans & Selection */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary neon-glow" />
                        <h2 className="font-display font-black italic text-2xl uppercase tracking-tighter mb-6 pl-4">
                            ESCOLHA SEU <span className="text-primary text-blur-sm">PLANO</span>
                        </h2>

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-3">CICLO DE PAGAMENTO</span>
                                <div className="flex gap-2 p-1 bg-white/5 border border-white/5 w-fit">
                                    <button
                                        onClick={() => setSelectedCycle('MENSAL')}
                                        className={cn(
                                            "px-6 py-2 font-display font-black italic text-[11px] uppercase tracking-widest transition-all",
                                            selectedCycle === 'MENSAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        Mensal
                                    </button>
                                    <button
                                        onClick={() => setSelectedCycle('ANUAL')}
                                        className={cn(
                                            "px-6 py-2 font-display font-black italic text-[11px] uppercase tracking-widest transition-all",
                                            selectedCycle === 'ANUAL' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        Anual
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-3">MÉTODO DE PAGAMENTO</span>
                                <div className="flex gap-2 p-1 bg-white/5 border border-white/5 w-fit">
                                    <button
                                        onClick={() => setPaymentMethod('CREDIT_CARD')}
                                        className={cn(
                                            "px-6 py-2 font-display font-black italic text-[11px] uppercase tracking-widest transition-all flex items-center gap-2",
                                            paymentMethod === 'CREDIT_CARD' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        <CreditCard size={14} />
                                        Cartão
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('PIX')}
                                        className={cn(
                                            "px-6 py-2 font-display font-black italic text-[11px] uppercase tracking-widest transition-all flex items-center gap-2",
                                            paymentMethod === 'PIX' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                                        )}
                                    >
                                        <QrCode size={14} />
                                        Pix
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mb-8">
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] block mb-3">CPF / CNPJ DO TITULAR</span>
                                <input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    className="w-full bg-white/5 border border-white/10 h-10 px-4 font-mono text-sm tracking-widest focus:border-primary outline-none transition-colors"
                                    value={cpfCnpj}
                                    onChange={(e) => setCpfCnpj(e.target.value)}
                                />
                            </div>
                        </div>

                        {paymentMethod === 'CREDIT_CARD' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                {/* Credit Card Form */}
                                <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                                    <div className="bg-white/5 border border-white/10 p-6 space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Número do Cartão</label>
                                            <input
                                                type="text"
                                                placeholder="0000 0000 0000 0000"
                                                className="w-full bg-black border border-white/10 h-12 px-4 font-mono text-sm tracking-widest focus:border-primary outline-none transition-colors"
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Nome Impresso</label>
                                            <input
                                                type="text"
                                                placeholder="MARIO S SILVA"
                                                className="w-full bg-black border border-white/10 h-12 px-4 font-mono text-sm tracking-widest focus:border-primary outline-none transition-colors uppercase"
                                                value={cardDetails.name}
                                                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Validade</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/AA"
                                                    className="w-full bg-black border border-white/10 h-12 px-4 font-mono text-sm tracking-widest focus:border-primary outline-none transition-colors"
                                                    value={cardDetails.expiry}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">CVV</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    className="w-full bg-black border border-white/10 h-12 px-4 font-mono text-sm tracking-widest focus:border-primary outline-none transition-colors"
                                                    value={cardDetails.cvv}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-primary/10 border border-primary/30 p-4 flex items-center gap-3">
                                        <ShieldCheck className="text-primary h-5 w-5" />
                                        <p className="text-primary font-display font-black italic text-[11px] uppercase tracking-widest">
                                            EXCLUSIVO: 30 DIAS GRÁTIS ATIVADOS
                                        </p>
                                    </div>
                                </div>

                                {/* Plan Summary Preview */}
                                <div className="space-y-4">
                                    {plans.map((plan) => (
                                        <Card key={plan.id} className="bg-zinc-950 border-primary/20 rounded-none p-8 flex flex-col relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Zap className="text-primary h-20 w-20" />
                                            </div>
                                            <h3 className="font-display font-black italic text-xl text-white uppercase mb-2 tracking-tight">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-primary font-display font-black italic text-2xl leading-none">R$</span>
                                                <span className="text-5xl font-display font-black italic text-white leading-none">
                                                    {selectedCycle === 'MENSAL' ? plan.price_monthly.toFixed(2).replace('.', ',') : (plan.price_yearly / 12).toFixed(2).replace('.', ',')}
                                                </span>
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">/mês</span>
                                            </div>
                                            <Button
                                                onClick={handleSubscribe}
                                                disabled={processing}
                                                className="btn-athletic w-full h-14 text-[12px] bg-primary text-black hover:bg-white transition-all shadow-lg shadow-primary/20"
                                            >
                                                {processing ? 'PROCESSANDO...' : 'CONFIRMAR E INICIAR TESTE'}
                                                {!processing && <ArrowRight size={18} className="ml-2" />}
                                            </Button>
                                            <p className="text-center mt-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                                Cobranca automática após 30 dias.
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans.map((plan) => (
                                        <Card key={plan.id} className="bg-white/5 border-white/10 rounded-none p-8 flex flex-col relative overflow-hidden group hover:border-primary/30 transition-all">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <QrCode size={80} />
                                            </div>
                                            <h3 className="font-display font-black italic text-xl text-white uppercase mb-2 tracking-tight group-hover:text-primary transition-colors">
                                                {plan.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2 mb-8">
                                                <span className="text-primary font-display font-black italic text-2xl leading-none">R$</span>
                                                <span className="text-5xl font-display font-black italic text-white leading-none">
                                                    {selectedCycle === 'MENSAL' ? plan.price_monthly.toFixed(2).replace('.', ',') : (plan.price_yearly / 12).toFixed(2).replace('.', ',')}
                                                </span>
                                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">/mês</span>
                                            </div>
                                            <Button
                                                onClick={handleSubscribe}
                                                disabled={processing}
                                                className="btn-athletic w-full h-12 text-[11px]"
                                            >
                                                {processing ? 'PROCESSANDO...' : 'ATIVAR VIA PIX'}
                                                {!processing && <ArrowRight size={16} className="ml-2" />}
                                            </Button>
                                            <div className="mt-6 p-4 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
                                                <AlertCircle className="text-amber-500 h-4 w-4 mt-0.5" />
                                                <p className="text-amber-500/70 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                                    Atenção: O pagamento via Pix não oferece período de teste grátis. A cobrança é imediata.
                                                </p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features HUD */}
                    <div className="bg-primary/5 border border-primary/20 p-8 relative overflow-hidden">
                        <div className="scanline opacity-10" />
                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <ShieldCheck className="text-primary h-8 w-8 neon-glow" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-display font-black italic text-white uppercase mb-1 tracking-tight">Segurança Asaas Pay</h4>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    Pagamentos processados via Asaas IP S.A. com criptografia de ponta a ponta e cancelamento instantâneo.
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-16 border border-white/10 flex items-center justify-center opacity-40">
                                    <div className="font-black italic text-xs">PIX</div>
                                </div>
                                <div className="h-10 w-16 border border-white/10 flex items-center justify-center opacity-40">
                                    <CreditCard size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Current Subscription Details */}
                <div className="space-y-6">
                    <Card className="bg-zinc-950 border-white/5 rounded-none p-6 relative">
                        <div className="scanline" />
                        <h3 className="font-display font-black italic text-sm text-white uppercase mb-6 tracking-widest flex items-center gap-2">
                            <Clock className="text-primary h-4 w-4" />
                            MINHA ASSINATURA
                        </h3>

                        {subscription ? (
                            <div className="space-y-6">
                                <div>
                                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Plano Atual</span>
                                    <p className="font-display font-black italic text-primary uppercase text-lg">{subscription.plan?.name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Próximo Venc.</span>
                                        <p className="text-white font-display font-bold italic text-sm">
                                            {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Valor Mensal</span>
                                        <p className="text-white font-display font-bold italic text-sm">R$ {subscription.plan?.price_monthly.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <Button variant="ghost" className="w-full text-zinc-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest h-8">
                                        CANCELAR RENOVAÇÃO
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 border border-dashed border-white/10">
                                <AlertCircle className="h-8 w-8 text-white/20 mx-auto mb-4" />
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Nenhuma assinatura ativa</p>
                            </div>
                        )}
                    </Card>

                    {/* Delinquency Alert */}
                    {tenant?.subscription_status === 'past_due' && (
                        <Card className="bg-red-500/10 border-red-500/30 rounded-none p-6 relative overflow-hidden animate-pulse">
                            <ShieldAlert className="text-red-500 h-8 w-8 mb-4 neon-glow-red" />
                            <h4 className="font-display font-black italic text-red-500 uppercase mb-2 tracking-tight">ASSINATURA EM ATRASO</h4>
                            <p className="text-red-500/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Seu acesso será bloqueado em breve. Regularize o pagamento para evitar interrupções no serviço.
                            </p>
                        </Card>
                    )}

                    <div className="bg-white/5 border border-white/10 p-6">
                        <h4 className="font-display font-black italic text-[10px] text-white/40 uppercase mb-4 tracking-widest">SUPORTE AO CLIENTE</h4>
                        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed mb-4">
                            Dúvidas sobre pagamentos, estornos ou upgrade de plano? Entre em contato com nossa central.
                        </p>
                        <Button variant="outline" className="w-full border-white/10 text-[10px] font-bold uppercase tracking-widest h-10 hover:bg-primary hover:text-black hover:border-primary transition-all">
                            ABRIR CHAMADO
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingPage;
