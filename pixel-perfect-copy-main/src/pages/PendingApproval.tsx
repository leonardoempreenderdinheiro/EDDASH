import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Clock } from "lucide-react";

export default function PendingApproval() {
    const { signOut } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-xl">Aprovação Pendente</CardTitle>
                    <CardDescription className="pt-2">
                        Seu cadastro foi realizado com sucesso e está aguardando aprovação do administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Você receberá acesso assim que sua conta for verificada e aprovada pela equipe Master.
                        Entre em contato com o suporte se precisar de ajuda urgente.
                    </p>
                    <Button variant="outline" onClick={() => signOut()} className="w-full">
                        Sair e tentar novamente mais tarde
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
