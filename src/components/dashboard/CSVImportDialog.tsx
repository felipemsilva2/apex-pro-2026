import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Upload, FileUp, Loader2, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import Papa from "papaparse";
import { TenantService } from "@/api/services/tenantService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImportRow {
    "Nome Completo": string;
    "Email/Usuário": string;
    "Senha": string;
    status: 'pending' | 'success' | 'error';
    error?: string;
}

export function CSVImportDialog() {
    const { profile } = useAuth();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<ImportRow[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState<{ success: number; failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data
                    .filter((row: any) => {
                        // Filter out rows that don't have at least a name
                        const name = row["Nome Completo"] || row["Nome"];
                        return name && name.trim().length > 0;
                    })
                    .map((row: any) => {
                        const fullName = row["Nome Completo"] || row["Nome"] || "";

                        // Generate username: joao silva -> joao.silva
                        let generatedUsername = row["Email/Usuário"] || row["Email"] || row["Usuário"];

                        if (!generatedUsername) {
                            const nameParts = fullName.trim().toLowerCase()
                                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                                .split(/\s+/);

                            if (nameParts.length >= 2) {
                                generatedUsername = `${nameParts[0]}.${nameParts[nameParts.length - 1]}`;
                            } else {
                                generatedUsername = nameParts[0] || `aluno${Math.floor(Math.random() * 1000)}`;
                            }
                        }

                        return {
                            "Nome Completo": fullName,
                            "Email/Usuário": generatedUsername.toLowerCase().trim(),
                            "Senha": row["Senha"] || "apex2026",
                            status: 'pending' as const
                        };
                    });
                setData(rows);
                setSummary(null);
                setProgress(0);
            },
            error: (error) => {
                toast.error("Erro ao ler CSV", { description: error.message });
            }
        });
    };

    const downloadTemplate = () => {
        const csv = Papa.unparse([
            { "Nome Completo": "João Silva", "Email/Usuário": "", "Senha": "" },
            { "Nome Completo": "Maria Oliveira", "Email/Usuário": "maria.oliveira", "Senha": "senha_customizada" }
        ]);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "modelo_importacao_apex.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const runImport = async () => {
        if (!profile?.tenant_id || data.length === 0) return;

        setIsImporting(true);
        setSummary(null);
        let successCount = 0;
        let failedCount = 0;

        const service = new TenantService(profile.tenant_id);

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                const result = await service.manageAthlete({
                    fullName: row["Nome Completo"],
                    username: row["Email/Usuário"],
                    password: row["Senha"],
                    tenantId: profile.tenant_id
                });

                if (result.error) throw new Error(result.error);

                successCount++;
                data[i].status = 'success';
            } catch (error: any) {
                failedCount++;
                data[i].status = 'error';
                data[i].error = error.message;
            }

            setData([...data]);
            setProgress(Math.round(((i + 1) / data.length) * 100));
            // Small delay to prevent rate limit issues
            await new Promise(r => setTimeout(r, 100));
        }

        setIsImporting(false);
        setSummary({ success: successCount, failed: failedCount });
        toast.success("Importação concluída!", {
            description: `${successCount} alunos importados, ${failedCount} falhas.`
        });
    };

    const reset = () => {
        setFile(null);
        setData([]);
        setProgress(0);
        setIsImporting(false);
        setSummary(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/20 transition-all rounded-none flex items-center gap-2 group">
                    <FileUp size={18} className="text-white/40 group-hover:text-primary transition-colors" />
                    <span className="font-display font-bold italic uppercase text-[10px] tracking-widest leading-none">IMPORTAR ALUNOS</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white rounded-none sm:max-w-[700px] p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                <DialogHeader className="p-8 pb-6 bg-white/[0.02] border-b border-white/5">
                    <DialogTitle className="font-display font-black italic uppercase text-2xl tracking-tighter flex flex-col leading-none">
                        <span className="text-white/40 text-[9px] tracking-[0.4em] mb-2 not-italic font-bold">BATCH PROCESSING</span>
                        <span className="flex items-center gap-3">
                            IMPORTAÇÃO <span className="text-primary text-blur-sm">EM MASSA</span>
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {data.length === 0 ? (
                        <div className="space-y-6 animate-fade-in">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-white/10 p-12 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />
                                <Upload size={48} className="mx-auto mb-4 text-white/10 group-hover:text-primary group-hover:scale-110 transition-all" />
                                <p className="font-display font-black italic uppercase text-sm tracking-wider mb-2">SELECIONE OU ARRASTE SEU CSV</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">FORMATO ACEITO: .CSV (UTf-8)</p>
                            </div>

                            <div className="bg-white/5 p-6 border border-white/5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(212,255,0,0.5)]" />
                                    <h4 className="font-display font-bold italic uppercase text-[10px] tracking-widest text-primary">DICA PRO</h4>
                                </div>
                                <p className="text-[11px] text-white/60 leading-relaxed uppercase font-medium">
                                    USE NOSSO MODELO PARA GARANTIR QUE AS COLUNAS ESTEJAM NO FORMATO CORRETO. O SISTEMA IDENTIFICA AUTOMATICAMENTE "NOME", "EMAIL" E "SENHA".
                                </p>
                                <Button
                                    variant="link"
                                    onClick={downloadTemplate}
                                    className="p-0 h-auto text-primary text-[10px] font-black italic uppercase tracking-widest hover:text-primary/80"
                                >
                                    <Download size={14} className="mr-2" />
                                    BAIXAR MODELO CSV
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="font-display font-black italic uppercase text-sm tracking-tighter">PREVIEW: {data.length} REGISTROS</span>
                                    {isImporting && <Loader2 className="animate-spin text-primary" size={16} />}
                                </div>
                                {!isImporting && (
                                    <Button variant="ghost" size="sm" onClick={reset} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-none h-8 px-2 transition-all">
                                        <Trash2 size={16} className="mr-2" />
                                        REMOVER
                                    </Button>
                                )}
                            </div>

                            <div className="border border-white/10 bg-black overflow-hidden h-[300px] flex flex-col">
                                <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40">
                                    <div className="col-span-5">NOME COMPLETO</div>
                                    <div className="col-span-5">EMAIL / USUÁRIO</div>
                                    <div className="col-span-2 text-center">STATUS</div>
                                </div>
                                <TooltipProvider>
                                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 custom-scrollbar">
                                        {data.map((row, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 p-3 border-b border-white/5 items-center hover:bg-white/[0.02]">
                                                <div className="col-span-5 font-display font-bold text-[10px] uppercase italic text-white/80 truncate">{row["Nome Completo"]}</div>
                                                <div className="col-span-5 text-[10px] text-white/40 font-mono truncate">{row["Email/Usuário"]}</div>
                                                <div className="col-span-2 flex justify-center">
                                                    {row.status === 'pending' && <div className="w-2 h-2 rounded-full bg-white/10" />}
                                                    {row.status === 'success' && <CheckCircle2 size={16} className="text-primary" />}
                                                    {row.status === 'error' && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <AlertCircle size={16} className="text-destructive" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="bg-destructive text-white text-[10px] font-bold border-0 rounded-none">
                                                                {row.error}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </TooltipProvider>
                            </div>

                            {isImporting && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between font-display font-black italic uppercase text-[10px] tracking-widest">
                                        <span className="text-primary animate-pulse">IMPORTANDO ALUNOS...</span>
                                        <span className="text-white/40">{progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 relative">
                                        <div
                                            className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(212,255,0,0.5)]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {summary && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/5 border border-primary/20 p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[.2em] text-primary/60 mb-1">SUCESSO</p>
                                        <p className="text-4xl font-display font-black italic text-primary leading-none">{summary.success}</p>
                                    </div>
                                    <div className="bg-destructive/5 border border-destructive/20 p-4 text-center">
                                        <p className="text-[9px] font-black uppercase tracking-[.2em] text-destructive/60 mb-1">FALHAS</p>
                                        <p className="text-4xl font-display font-black italic text-destructive leading-none">{summary.failed}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <Button
                                    className="w-full btn-athletic h-14 group relative overflow-hidden disabled:opacity-50"
                                    disabled={isImporting || summary !== null}
                                    onClick={runImport}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    {isImporting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span className="font-display font-black italic uppercase tracking-widest">INICIAR IMPORTAÇÃO TÁTICA</span>
                                            <Upload size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
