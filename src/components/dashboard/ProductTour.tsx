
import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";


export const ProductTour = () => {
    const { profile } = useAuth();
    const [run, setRun] = useState(false);

    useEffect(() => {
        // Run tour if user hasn't seen it and the profile is loaded
        if (profile && !profile.has_seen_tour) {
            setRun(true);
        }
    }, [profile?.id, profile?.has_seen_tour]);

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data;
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            if (profile?.id) {
                // Update database
                await supabase
                    .from('profiles')
                    .update({ has_seen_tour: true })
                    .eq('id', profile.id);
            }
        }
    };

    const steps: Step[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div className="flex flex-col gap-4 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl">🚀</span>
                    </div>
                    <div>
                        <h2 className="font-display font-black italic uppercase text-xl mb-2">
                            Acesso Liberado 🚀
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Este é seu centro de comando para gerenciar alunos, treinos e dietas.
                        </p>
                    </div>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '[data-tour="sidebar-nav"]',
            content: (
                <div className="text-sm">
                    <strong className="block font-display font-black uppercase italic mb-1 text-primary">Navegação Principal</strong>
                    Aqui é onde tudo acontece. Acesse seus Alunos, Agenda, Treinos/Dietas e Chat rapidamente.
                </div>
            ),
            placement: 'right',
        },
        {
            target: '[data-tour="quick-actions"]',
            content: (
                <div className="text-sm">
                    <strong className="block font-display font-black uppercase italic mb-1 text-primary">Ações Rápidas</strong>
                    Atalhos táticos para as ações mais frequentes: Cadastrar Aluno e Criar Plano.
                </div>
            ),
            placement: 'bottom',
        },
        {
            target: '[data-tour="chat-indicator"]',
            content: (
                <div className="text-sm">
                    <strong className="block font-display font-black uppercase italic mb-1 text-primary">Central de Comunicação</strong>
                    Fique atento às notificações. Mantenha contato direto com seus alunos por aqui.
                </div>
            ),
            placement: 'right',
        },
        {
            target: '[data-tour="user-profile"]',
            content: (
                <div className="text-sm">
                    <strong className="block font-display font-black uppercase italic mb-1 text-primary">Sua Marca</strong>
                    Acesse as Configurações para personalizar seu perfil, logo e cores do app.
                </div>
            ),
            placement: 'right',
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            disableOverlayClose={true}
            spotlightPadding={10}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#D4FF00', // Neon Lime (Primary)
                    backgroundColor: '#09090b', // Zinc 950
                    textColor: '#fff',
                    arrowColor: '#09090b',
                },
                buttonNext: {
                    backgroundColor: '#D4FF00',
                    color: '#000',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 800,
                    fontSize: '12px',
                    borderRadius: '0px',
                    padding: '8px 16px',
                    textTransform: 'uppercase',
                    fontStyle: 'italic',
                    letterSpacing: '0.05em',
                },
                buttonBack: {
                    color: '#fff',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    marginRight: 10,
                },
                buttonSkip: {
                    color: '#71717a', // Zinc 500
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                },
                tooltip: {
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
                tooltipContent: {
                    padding: '10px 0',
                }
            }}
            locale={{
                back: 'Voltar',
                close: 'Fechar',
                last: 'Concluir',
                next: 'Próximo',
                skip: 'Pular',
            }}
        />
    );
};
