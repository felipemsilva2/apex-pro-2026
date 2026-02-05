import { useLatestAssessment } from "@/hooks/useAssessments";
import { useCurrentClient } from "@/hooks/useClientData";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Scale, Flame, Dumbbell, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { AssessmentService } from "@/api/services/assessmentService";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ProgressCard() {
    const { data: client } = useCurrentClient();
    const { data: latestAssessment, isLoading } = useLatestAssessment(client?.id);

    if (isLoading) return null;
    if (!latestAssessment) return null;

    const assessmentDate = new Date(latestAssessment.assessment_date);
    const timeAgo = formatDistanceToNow(assessmentDate, { addSuffix: true, locale: ptBR });

    return (
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">Meu Progresso Físico</CardTitle>
                    </div>
                    <Link
                        to="/app/progress"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                        Ver tudo
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
                <p className="text-xs text-muted-foreground">Última avaliação {timeAgo}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-1 mb-1">
                            <Scale className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Peso</p>
                        </div>
                        <p className="text-lg font-bold">{latestAssessment.weight_kg?.toFixed(1)} kg</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-1 mb-1">
                            <Flame className="w-3 h-3 text-red-500" />
                            <p className="text-xs text-muted-foreground">Gordura</p>
                        </div>
                        <p className="text-lg font-bold">{latestAssessment.body_fat_percentage?.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center gap-1 mb-1">
                            <Dumbbell className="w-3 h-3 text-green-500" />
                            <p className="text-xs text-muted-foreground">M. Magra</p>
                        </div>
                        <p className="text-lg font-bold">{latestAssessment.lean_mass_kg?.toFixed(1)} kg</p>
                    </div>
                </div>

                {latestAssessment.notes && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Observações do profissional:</p>
                        <p className="text-sm">{latestAssessment.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
