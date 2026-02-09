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
    const [pendingPix, setPendingPix] = useState<any>(null);

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

            // If pending and probably Pix (since we use Pix for pending after checkout)
            if (subData?.status === 'pending' && subData?.asaas_id) {
                console.log("Fetching pending Pix data...");
                const { data: pixData } = await supabase.functions.invoke('asaas-manager', {
                    body: {
                        action: 'get-pix-qr-code',
                        payload: { paymentId: subData.asaas_id }
                    }
                });
                if (pixData) setPendingPix(pixData);
            }
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

            toast.success(paymentMethod === 'CREDIT_CARD' && !tenant?.trial_used
                ? "Assinatura ativada! Você tem 30 dias de teste grátis."
                : paymentMethod === 'CREDIT_CARD'
                    ? "Assinatura ativada! Cobrança processada com sucesso."
                    : "Assinatura iniciada! Aguardando pagamento do Pix.");

            loadBillingData();
        } catch (error: any) {
            toast.error(`Falha ao iniciar assinatura: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleResetPayment = async () => {
        if (!subscription?.asaas_id) return;

        try {
            setProcessing(true);
            const { error } = await supabase.functions.invoke('asaas-manager', {
                body: {
                    action: 'cancel-subscription',
                    payload: { subscriptionId: subscription.asaas_id }
                }
            });

            if (error) throw error;

            toast.success("Transação Cancelada", {
                description: "Agora você pode escolher uma nova forma de pagamento."
            });

            setPendingPix(null);
            loadBillingData();
        } catch (error: any) {
            toast.error(`Falha ao resetar pagamento: ${error.message}`);
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

    const isPending = tenant?.subscription_status === 'pending';

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
                                tenant?.subscription_status === 'active' || tenant?.subscription_status === 'trialing'
                                    ? "bg-primary neon-glow"
                                    : isPending
                                        ? "bg-amber-500 animate-pulse"
                                        : "bg-zinc-500"
                            )} />
                            <span className="font-display font-bold italic uppercase text-sm">
                                {tenant?.subscription_status === 'active' ? 'LICENÇA ATIVA' :
                                    tenant?.subscription_status === 'trialing' ? 'PERÍODO DE TESTE' :
                                        isPending ? 'PAGAMENTO PENDENTE' : 'INATIVO'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Plans or Pending View */}
                <div className="lg:col-span-2 space-y-8">
                    {isPending && pendingPix ? (
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                            <div className="pl-4 space-y-8">
                                <div>
                                    <h2 className="font-display font-black italic text-2xl uppercase tracking-tighter mb-2">
                                        AGUARDANDO <span className="text-amber-500">CONFIRMAÇÃO</span>
                                    </h2>
                                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                        Escaneie o QR Code abaixo para liberar seu acesso instantaneamente.
                                    </p>
                                </div>

                                <div className="athletic-card p-10 bg-zinc-900/40 border-2 border-primary/20 flex flex-col items-center gap-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16" />

                                    <div className="bg-white p-4 rounded-xl shadow-2xl shadow-primary/20 scale-110">
                                        <img
                                            src={`data:image/png;base64,${pendingPix.encodedImage}`}
                                            alt="Pix QR Code"
                                            className="w-56 h-56"
                                        />
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="p-4 bg-black/60 border border-white/5 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Código Pix Copia e Cola</span>
                                                <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                    AGUARDANDO PAGAMENTO
                                                </Badge>
                                            </div>
                                            <code className="text-[10px] font-mono text-primary/80 break-all select-all leading-relaxed block">
                                                {pendingPix.payload}
                                            </code>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pendingPix.payload);
                                                    toast.success("Código Copiado!", { description: "Cole no App do seu banco." });
                                                }}
                                                className="btn-athletic flex-1 bg-primary text-black"
                                            >
                                                COPIAR CÓDIGO PIX
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={handleResetPayment}
                                                disabled={processing}
                                                className="border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 transition-all font-display"
                                            >
                                                {processing ? "PROCESSANDO..." : "MUDAR FORMA DE PAGAMENTO"}
                                            </Button>
                                        </div>

                                        <p className="text-center text-[9px] text-zinc-500 uppercase font-bold tracking-widest">
                                            O código Pix expira em 24h. Se expirar, clique em "Mudar forma de pagamento" acima.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-white/5">
                                    <Clock className="text-amber-500 h-5 w-5 animate-spin-slow" />
                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                        O acesso será liberado automaticamente assim que o banco confirmar o pagamento.
                                        Não é necessário enviar comprovante.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : tenant?.subscription_status === 'active' || tenant?.subscription_status === 'trialing' ? (
                        <div className="relative">
                            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary neon-glow" />
                            <div className="pl-4 space-y-6">
                                <h2 className="font-display font-black italic text-2xl uppercase tracking-tighter">
                                    LICENÇA <span className="text-primary">ATIVA</span>
                                </h2>
                                <div className="athletic-card p-8 bg-zinc-900/40 border border-white/5 flex flex-col md:flex-row items-center gap-8">
                                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="text-primary h-10 w-10 neon-glow" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-display font-black italic text-xl uppercase tracking-tight">Tudo pronto, {profile?.full_name?.split(' ')[0]}!</h3>
                                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                                            Você tem acesso total ao ecossistema NutriPro Hub. Sua assinatura está sendo processada via Asaas.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-primary/20 text-primary hover:bg-primary hover:text-black transition-all text-[10px] font-black italic uppercase tracking-widest h-12 px-8"
                                        onClick={() => window.location.href = '/dashboard'}
                                    >
                                        IR PARA O DASHBOARD
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
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

                                        {!tenant?.trial_used && (
                                            <div className="bg-primary/10 border border-primary/30 p-4 flex items-center gap-3">
                                                <ShieldCheck className="text-primary h-5 w-5" />
                                                <p className="text-primary font-display font-black italic text-[11px] uppercase tracking-widest">
                                                    EXCLUSIVO: 30 DIAS GRÁTIS ATIVADOS
                                                </p>
                                            </div>
                                        )}
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
                                                {selectedCycle === 'ANUAL' && (
                                                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-6 animate-in fade-in duration-500">
                                                        TOTAL: R$ {plan.price_yearly.toFixed(2).replace('.', ',')} / ANO
                                                    </p>
                                                )}
                                                <Button
                                                    onClick={handleSubscribe}
                                                    disabled={processing}
                                                    className="btn-athletic w-full h-14 text-[12px] bg-primary text-black hover:bg-white transition-all shadow-lg shadow-primary/20"
                                                >
                                                    {processing ? 'PROCESSANDO...' : (!tenant?.trial_used ? 'CONFIRMAR E INICIAR TESTE' : 'CONFIRMAR ASSINATURA')}
                                                    {!processing && <ArrowRight size={18} className="ml-2" />}
                                                </Button>
                                                <p className="text-center mt-4 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                                    {tenant?.trial_used ? 'Cobrança imediata e recorrente.' : 'Cobranca automática após 30 dias.'}
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
                                                {selectedCycle === 'ANUAL' && (
                                                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-8 animate-in fade-in duration-500">
                                                        TOTAL: R$ {plan.price_yearly.toFixed(2).replace('.', ',')} / ANO
                                                    </p>
                                                )}
                                                <Button
                                                    onClick={handleSubscribe}
                                                    disabled={processing}
                                                    className="btn-athletic w-full h-12 text-[11px]"
                                                >
                                                    {processing ? 'PROCESSANDO...' : 'ATIVAR VIA PIX'}
                                                    {!processing && <ArrowRight size={16} className="ml-2" />}
                                                </Button>
                                                {/* Compact Integrated Trust Badge */}
                                                <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                                                    <ShieldCheck className="text-primary h-5 w-5" />
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">
                                                            Segurança Asaas Pay
                                                        </p>
                                                        <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-zinc-500 leading-tight">
                                                            Transações criptografadas via Asaas IP S.A.
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 grayscale brightness-50">
                                                        <CreditCard size={12} />
                                                        <span className="font-black italic text-[8px]">PIX</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
                {
                    tenant?.subscription_status === 'past_due' && (
                        <Card className="bg-red-500/10 border-red-500/30 rounded-none p-6 relative overflow-hidden animate-pulse">
                            <ShieldAlert className="text-red-500 h-8 w-8 mb-4 neon-glow-red" />
                            <h4 className="font-display font-black italic text-red-500 uppercase mb-2 tracking-tight">ASSINATURA EM ATRASO</h4>
                            <p className="text-red-500/70 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Seu acesso será bloqueado em breve. Regularize o pagamento para evitar interrupções no serviço.
                            </p>
                        </Card>
                    )
                }

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
    );
};

export default BillingPage;
