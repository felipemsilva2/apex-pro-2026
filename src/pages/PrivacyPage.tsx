import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-32 pb-24">
                <div className="section-container max-w-4xl">
                    <div className="mb-20 animate-fade-in text-center">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
                                POLÍTICA DE PRIVACIDADE
                            </span>
                            <span className="h-px w-8 bg-primary"></span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black mb-8 italic leading-[0.95] tracking-tighter uppercase">
                            SUA PRIVACIDADE <br />
                            <span className="text-primary text-blur-sm">É NOSSA PRIORIDADE</span>
                        </h1>
                        <p className="font-display font-bold uppercase italic text-xs tracking-widest text-white/30">
                            Conformidade total com a LGPD.
                        </p>
                    </div>

                    <div className="space-y-12 font-sans text-white/70 leading-relaxed max-w-4xl mx-auto">
                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">1. CONTROLE E RESPONSABILIDADE</h2>
                            <p className="mb-4">
                                Para fins da Lei Geral de Proteção de Dados (LGPD), o Apex Pro atua como <span className="text-white font-bold">Operador de Dados</span> em relação às informações dos alunos inseridas pelos profissionais (coaches/nutricionistas), que atuam como <span className="text-white font-bold">Controladores</span>. Nós processamos esses dados apenas sob suas instruções e para a finalidade estrita da prestação do serviço.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">2. DADOS COLETADOS E FINALIDADE</h2>
                            <p className="mb-4">
                                Coletamos dados cadastrais (nome, e-mail, CPF, data de nascimento) para gestão de conta e faturamento, além de dados de performance física (peso, medidas, histórico de treino) estritamente necessários para a prescrição de protocolos personalizados.
                            </p>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">3. DADOS SENSÍVEIS (SAÚDE)</h2>
                            <p className="mb-4 text-primary font-bold">
                                Como ecossistema de fitness e saúde, processamos dados sensíveis sobre sua condição física e hábitos dietéticos.
                            </p>
                            <p>
                                O processamento desses dados ocorre mediante seu consentimento explícito no momento do cadastro ou conforme necessário para a execução do contrato de prestação de serviços de consultoria fitness.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">4. COMPARTILHAMENTO COM TERCEIROS</h2>
                            <p className="mb-4">
                                Seus dados podem ser compartilhados com parceiros tecnológicos essenciais, tais como:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><span className="text-white">Supabase:</span> Armazenamento e autenticação segura.</li>
                                <li><span className="text-white">Gateways de Pagamento:</span> Processamento de transações financeiras sob padrões PCI-DSS.</li>
                                <li><span className="text-white">Serviços de Push:</span> Firebase/OneSignal para notificações de novos treinos.</li>
                            </ul>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">5. TRANSFERÊNCIA INTERNACIONAL</h2>
                            <p className="mb-4">
                                Como utilizamos infraestrutura de nuvem global (como AWS e Supabase), seus dados podem ser processados em servidores fora do território brasileiro. Garantimos que tais transferências ocorrem para países com nível adequado de proteção de dados ou mediante cláusulas contratuais padrão.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">6. DIREITOS DOS TITULARES (LGPD)</h2>
                            <p className="mb-4">
                                Você possui direitos fundamentais sob a LGPD:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Confirmação da existência de tratamento.</li>
                                <li>Acesso aos dados e correção de informações incompletas.</li>
                                <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                                <li>Portabilidade dos dados para outro fornecedor de serviço.</li>
                            </ul>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">7. SEGURANÇA DA INFORMAÇÃO</h2>
                            <p className="mb-4">
                                Utilizamos criptografia de ponta a ponta em dados em trânsito (SSL/TLS) e firewalls robustos. O acesso aos dados é restrito apenas a colaboradores autorizados e estritamente necessários para a manutenção da plataforma.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">8. RETENÇÃO E ELIMINAÇÃO</h2>
                            <p className="mb-4">
                                Dados cadastrais são mantidos enquanto a conta estiver ativa. Após o encerramento da conta, podemos manter dados por períodos adicionais para cumprimento de obrigações legais ou exercício regular de direitos em processos judiciais.
                            </p>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">9. PROTEÇÃO DE MENORES</h2>
                            <p className="mb-4">
                                Nossos serviços não são direcionados a menores de 16 anos sem o consentimento dos pais ou responsáveis. Se tomarmos conhecimento de dados coletados inadvertidamente de menores sem autorização, procederemos com a exclusão imediata.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">10. COOKIES E RASTREAMENTO</h2>
                            <p className="mb-4">
                                Utilizamos cookies de sessão estritamente necessários para autenticação e segurança. Não utilizamos cookies de rastreamento de terceiros para perfis comportamentais de publicidade sem seu aviso ou consentimento prévio.
                            </p>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">11. ALTERAÇÕES NA POLÍTICA</h2>
                            <p className="mb-4">
                                Podemos atualizar esta política periodicamente. Notificaremos você sobre mudanças materiais através de e-mail ou avisos destacados no painel de controle do sistema.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">12. CONTATO E DPO (ENCARREGADO)</h2>
                            <p>
                                Para exercer seus direitos ou falar com nosso encarregado de proteção de dados: <br />
                                <span className="text-primary font-display font-bold uppercase italic tracking-widest mt-4 block p-4 bg-primary/5 border border-primary/20 text-center">ola@apexpro.fit</span>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
