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
    ShieldAlert,
    ExternalLink,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SubscriptionManagerProps {
    compact?: boolean;
}

export const SubscriptionManager = ({ compact = false }: SubscriptionManagerProps) => {
    const { profile } = useAuth();
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

            if (subData?.status === 'pending' && subData?.asaas_id) {
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
        if (!cpfCnpj || cpfCnpj.length < 11) {
            toast.error("Por favor, informe um CPF/CNPJ válido.");
            return;
        }
        if (paymentMethod === 'CREDIT_CARD') {
            if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                toast.error("Por favor, preencha todos os dados do cartão.");
                return;
            }
        }

        try {
            setProcessing(true);
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
                    postalCode: '00000000',
                    addressNumber: '0',
                    phone: profile?.phone || '0000000000'
                };
            }

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
            toast.success("Transação Cancelada", { description: "Escolha uma nova forma de pagamento." });
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
            <div className="space-y-4 animate-pulse">
                <Skeleton className="h-40 w-full bg-white/5" />
                <Skeleton className="h-64 w-full bg-white/5" />
            </div>
        );
    }

    const isPending = tenant?.subscription_status === 'pending';
    const isActive = tenant?.subscription_status === 'active' || tenant?.subscription_status === 'trialing';

    return (
        <div className={cn("space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500", compact ? "max-w-4xl" : "")}>

            {/* 1. Status Hero - Design matching Screenshot 2 */}
            <div className="relative overflow-hidden group">
                <div className={cn(
                    "absolute -left-1 top-0 bottom-0 w-1 transition-all duration-500",
                    isActive ? "bg-primary neon-glow" : isPending ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-zinc-500"
                )} />

                <div className="bg-zinc-900/40 border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm">
                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center transition-all duration-700",
                        isActive ? "bg-primary/10 text-primary shadow-[0_0_30px_rgba(212,255,0,0.1)]" : isPending ? "bg-amber-500/10 text-amber-500" : "bg-white/5 text-white/20"
                    )}>
                        {isActive ? <ShieldCheck className="h-10 w-10 neon-glow" /> : isPending ? <Clock className="h-10 w-10 animate-pulse" /> : <ShieldAlert className="h-10 w-10" />}
                    </div>

                    <div className="flex-1 space-y-2 text-center md:text-left">
                        <h2 className="font-display font-black italic text-2xl uppercase tracking-tight">
                            {isActive ? `TUDO PRONTO, ${profile?.full_name?.split(' ')[0]}!` : isPending ? "AGUARDANDO CONFIRMAÇÃO" : "LICENÇA INATIVA"}
                        </h2>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                            {isActive
                                ? `Você tem acesso total ao ecossistema ${tenant?.business_name || 'Apex Pro'}. Sua assinatura está ativa e regularizada.`
                                : isPending
                                    ? "Seu pagamento via Pix está sendo processado. Assim que confirmado, seu acesso será liberado instantaneamente."
                                    : "Sua licença expirou ou ainda não foi iniciada. Escolha um plano abaixo para começar."}
                        </p>
                    </div>

                    {!compact && isActive && (
                        <Button
                            variant="outline"
                            className="border-primary/20 text-primary hover:bg-primary hover:text-black transition-all text-[10px] font-black italic uppercase tracking-widest h-12 px-8"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            IR PARA O DASHBOARD
                        </Button>
                    )}

                    {!isActive && !isPending && (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-2 font-display italic font-black uppercase tracking-widest">
                            BLOQUEADO
                        </Badge>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 2. Main Content (Left/Center) */}
                <div className="lg:col-span-8 space-y-8">
                    {isPending && pendingPix ? (
                        <div className="athletic-card p-10 bg-zinc-900/60 border-2 border-primary/20 flex flex-col items-center gap-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

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
                            </div>
                        </div>
                    ) : isActive ? (
                        <div className="space-y-8">
                            {/* Current Plan Details */}
                            <div className="border-l-2 border-primary pl-6 py-4 space-y-6">
                                <h3 className="font-display font-black italic text-sm text-white/40 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="text-primary h-4 w-4" />
                                    MINHA ASSINATURA
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Plano Atual</span>
                                        <p className="font-display font-black italic text-primary uppercase text-2xl tracking-tighter">
                                            {subscription?.plan?.name || "APEXPRO COMPLETO"}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Próximo Venc.</span>
                                            <p className="text-white font-display font-bold italic text-sm">
                                                {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR') : '09/02/2027'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-1">Valor Mensal</span>
                                            <p className="text-white font-display font-bold italic text-sm">
                                                R$ {subscription?.plan?.price_monthly?.toFixed(2) || '49,99'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button className="text-zinc-500 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
                                        CANCELAR RENOVAÇÃO
                                    </button>
                                </div>
                            </div>

                            {/* Support Section */}
                            <div className="border-t border-white/5 pt-8">
                                <div className="bg-white/5 border border-white/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
                                    <div className="space-y-2">
                                        <h4 className="font-display font-black italic text-lg uppercase tracking-tight group-hover:text-primary transition-colors">SUPORTE AO CLIENTE</h4>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                                            Dúvidas sobre pagamentos, estornos ou upgrade de plano? Entre em contato com nossa central.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="lg" className="h-14 px-10 border-white/20 text-white hover:bg-primary hover:text-black hover:border-primary transition-all font-display font-black italic uppercase tracking-widest gap-2">
                                        <MessageCircle size={18} /> ABRIR CHAMADO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-left-4">
                            {/* Plans Selection UI (only if not active) */}
                            {/* ... Implementation of plans if not active ... */}
                        </div>
                    )}
                </div>

                {/* 3. Sidebar Info (Right) */}
                {!isPending && (
                    <div className="lg:col-span-4 space-y-6">
                        <div className="athletic-card p-6 bg-zinc-950/50 border border-white/5 relative group">
                            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-20 transition-all">
                                <ShieldCheck size={40} className="text-primary" />
                            </div>
                            <h4 className="font-display font-black italic text-[10px] text-primary uppercase mb-4 tracking-widest">ECOSSISTEMA INTEGRADO</h4>
                            <div className="space-y-4">
                                {[
                                    'GESTÃO DE ATLETAS',
                                    'PRESCRIÇÃO DE TREINO',
                                    'PLANEJAMENTO DIETÉTICO',
                                    'CHAT TEMPO REAL',
                                    'PÁGINA PÚBLICA PRO'
                                ].map(item => (
                                    <div key={item} className="flex items-center gap-3">
                                        <Check size={12} className="text-primary" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isActive && (
                            <div className="p-6 bg-primary/5 border border-primary/20 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-primary" />
                                    <h4 className="font-display font-black italic text-[10px] text-white uppercase tracking-widest">GESTÃO FINANCEIRA</h4>
                                </div>
                                <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                                    Sua assinatura é processada de forma segura através do Asaas Pay.
                                </p>
                                <Button variant="link" className="text-primary p-0 h-auto text-[9px] font-black italic uppercase tracking-widest gap-2 hover:no-underline hover:text-white transition-all">
                                    VER MEU HISTÓRICO <ArrowRight size={12} />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
