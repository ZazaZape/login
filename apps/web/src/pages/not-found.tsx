import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">404 - Página No Encontrada</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground mb-6">
            La página que buscas no existe o ha sido movida.
          </p>

          <Link to="/">
            <Button className="w-full" data-testid="button-home">
              <Home className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
