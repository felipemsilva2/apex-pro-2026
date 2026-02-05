import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="pt-32 pb-24">
                <div className="section-container max-w-4xl">
                    <div className="mb-20 animate-fade-in text-center">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className="h-px w-8 bg-primary"></span>
                            <span className="font-display font-black italic uppercase text-[10px] tracking-[0.4em] text-primary">
                                DOCUMENTAÇÃO JURÍDICA
                            </span>
                            <span className="h-px w-8 bg-primary"></span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black mb-8 italic leading-[0.95] tracking-tighter uppercase">
                            TERMOS DE <br />
                            <span className="text-primary text-blur-sm">USO</span>
                        </h1>
                        <p className="font-display font-bold uppercase italic text-xs tracking-widest text-white/30">
                            Última atualização: 05 de Fevereiro de 2026
                        </p>
                    </div>

                    <div className="space-y-12 font-sans text-white/70 leading-relaxed">
                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">1. ACEITAÇÃO DOS TERMOS</h2>
                            <p className="mb-4">
                                Ao acessar e utilizar a plataforma Apex Pro, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar nossos serviços.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">2. ISENÇÃO DE RESPONSABILIDADE MÉDICA</h2>
                            <p className="mb-4">
                                O Apex Pro é uma ferramenta de suporte tecnológico para profissionais de fitness. <span className="text-white font-bold">A plataforma não fornece aconselhamento médico, diagnóstico ou tratamento.</span> O uso das informações e protocolos gerados é de inteira responsabilidade do profissional prescritor e do usuário final. Recomendamos que os usuários busquem orientação médica antes de iniciar qualquer programa de exercícios ou dieta.
                            </p>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">3. PROPRIEDADE INTELECTUAL</h2>
                            <p className="mb-4">
                                Toda a estrutura, design, código-fonte e marcas associadas ao Apex Pro são de propriedade exclusiva da nossa empresa. O usuário retém a propriedade total dos dados de seus alunos e conteúdos próprios carregados na plataforma, mas concede ao Apex Pro uma licença limitada para hospedar e processar esses dados para a finalidade do serviço.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">4. ASSINATURAS E CANCELAMENTOS</h2>
                            <ul className="list-disc pl-5 space-y-4">
                                <li>O plano Apex Pro é uma assinatura recorrente no valor de R$ 39,90/mês.</li>
                                <li>O período de teste (Free Trial) de 30 dias é limitado a uma utilização por CPF/CNPJ.</li>
                                <li>O cancelamento pode ser solicitado a qualquer momento e interromperá a cobrança do próximo ciclo faturado. Não há reembolso para períodos parciais já utilizados.</li>
                            </ul>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">5. WHITELABEL E PUBLICAÇÃO</h2>
                            <p className="mb-4">
                                O serviço inclui o suporte para publicação do app whitelabel. No entanto, o Apex Pro não se responsabiliza por rejeições das lojas (Apple/Google) devido a nomes de marca já existentes, violação de direitos autorais de terceiros cometidos pelo usuário ou mudanças súbitas nas políticas das respectivas lojas.
                            </p>
                        </section>

                        <section className="border-l-4 border-primary/20 pl-8">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">6. RESCISÃO E SUSPENSÃO</h2>
                            <p className="mb-4">
                                Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos, pratiquem atividades ilegais, ou que utilizem a plataforma para propagar conteúdo ofensivo ou enganoso.
                            </p>
                        </section>

                        <section className="athletic-card p-8 lg:p-12 bg-white/[0.02] border-white/5">
                            <h2 className="font-display font-black italic uppercase text-2xl text-white mb-6 tracking-tighter">7. SUPORTE E CONTATO</h2>
                            <p>
                                Para suporte jurídico ou dúvidas sobre estes termos: <br />
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

export default TermsPage;
