import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatAmount, convertAmount, playSuccessSound } from "@/lib/app-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, PiggyBank, ArrowDownCircle, ArrowUpCircle, 
  ShieldCheck, AlertCircle, Phone, CreditCard, X 
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

// Types
type Devise = "XOF" | "USD";

interface Epargne {
  id: string;
  nom: string;
  montant_actuel: number;
  devise: Devise;
  created_at: string;
}

export default function InvestissementsPage() {
  const { toast } = useToast();
  const [epargnes, setEpargnes] = useState<Epargne[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContrat, setShowContrat] = useState(true); // Bloque l'accès au début
  const [showDepot, setShowDepot] = useState(false);
  const [showRetrait, setShowRetrait] = useState<Epargne | null>(null);

  // Formulaires
  const [formDepot, setFormDepot] = useState({ nom: "Mon Épargne Principale", montant: "", devise: "XOF" as Devise });
  const [formRetrait, setFormRetrait] = useState({ montant: "", reseau: "", numero: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("investissements" as any)
      .select("*")
      .eq("type_investissement", "epargne")
      .order("created_at", { ascending: false });
    setEpargnes((data as unknown as Epargne[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    // Vérifier si le contrat a déjà été accepté en local (optionnel)
    const accepted = localStorage.getItem("nexora_contrat_accepted");
    if (accepted) setShowContrat(false);
    load();
  }, []);

  const accepterContrat = () => {
    localStorage.setItem("nexora_contrat_accepted", "true");
    setShowContrat(false);
    playSuccessSound();
  };

  const handleDepot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDepot.montant) return;

    // Ici on simule l'intégration API de paiement
    // Idéalement, redirection vers API de paiement avant l'insert
    const { error } = await supabase.from("investissements" as any).insert({
      nom: formDepot.nom,
      montant_actuel: parseFloat(formDepot.montant),
      devise: formDepot.devise,
      type_investissement: "epargne",
      statut: "actif"
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Dépôt réussi", description: "Votre argent a été épargné avec succès." });
      setShowDepot(false);
      load();
    }
  };

  const handleRetrait = async () => {
    if (!showRetrait || !formRetrait.montant || !formRetrait.numero) return;
    
    const montantDemande = parseFloat(formRetrait.montant);
    if (montantDemande > showRetrait.montant_actuel) {
      toast({ title: "Solde insuffisant", variant: "destructive" });
      return;
    }

    const frais = montantDemande * 0.10;
    const montantFinal = montantDemande - frais;

    // Mise à jour du solde
    const nouveauSolde = showRetrait.montant_actuel - montantDemande;
    
    const { error } = await supabase
      .from("investissements" as any)
      .update({ montant_actuel: nouveauSolde })
      .eq("id", showRetrait.id);

    if (!error) {
      toast({ 
        title: "Retrait en cours", 
        description: `Retrait de ${formatAmount(montantFinal, showRetrait.devise)} vers ${formRetrait.numero} (Frais 10% déduits).` 
      });
      setShowRetrait(null);
      setFormRetrait({ montant: "", reseau: "", numero: "" });
      load();
    }
  };

  const totalGlobal = epargnes.reduce((s, i) => s + (i.devise === "XOF" ? i.montant_actuel : convertAmount(i.montant_actuel, "USD", "XOF")), 0);

  return (
    <AppLayout>
      {/* --- MODAL CONTRAT --- */}
      {showContrat && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-black">CONTRAT D’ÉPARGNE NEXORA</h2>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground">Bienvenue chez NEXORA.</p>
              <p>En accédant à cette fonctionnalité d’épargne, vous choisissez de faire un pas vers une meilleure gestion de vos finances.</p>
              <div className="bg-muted p-4 rounded-xl space-y-2">
                <p className="font-bold text-foreground">📌 Engagement de l’utilisateur</p>
                <p>En utilisant le service d’épargne NEXORA, vous acceptez de déposer volontairement des fonds. Ces fonds restent votre propriété exclusive.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-amber-900">
                <p className="font-bold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Accès et retrait des fonds</p>
                <p>Vous pouvez retirer votre argent à tout moment. Cependant, afin d'encourager la discipline :</p>
                <p className="font-black text-center text-lg">➡️ Frais de 10% sur chaque retrait.</p>
              </div>
            </div>

            <Button onClick={accepterContrat} className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold rounded-2xl">
              J'accepte les conditions
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Dashboard */}
        <div className="flex items-center justify-between bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 rounded-3xl text-white shadow-lg">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Solde Total Épargné</p>
            <h1 className="text-3xl font-black">{formatAmount(totalGlobal, "XOF")}</h1>
          </div>
          <PiggyBank className="w-12 h-12 text-emerald-200 opacity-50" />
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => setShowDepot(true)} className="h-20 rounded-2xl bg-card border border-border text-foreground hover:bg-emerald-50 hover:text-emerald-700 flex-col gap-1 transition-all">
            <ArrowDownCircle className="w-6 h-6" />
            <span className="font-bold">Déposer</span>
          </Button>
          <Button variant="outline" className="h-20 rounded-2xl flex-col gap-1 border-dashed border-2">
            <span className="text-xs text-muted-foreground">Numéros enregistrés</span>
            <span className="font-bold">Gérer</span>
          </Button>
        </div>

        {/* Liste des comptes d'épargne */}
        <div className="space-y-4">
          <h3 className="font-black text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" /> Vos comptes d'épargne
          </h3>
          
          {loading ? (
            <div className="h-32 flex items-center justify-center">Chargement...</div>
          ) : epargnes.length === 0 ? (
            <div className="p-10 border-2 border-dashed rounded-3xl text-center text-muted-foreground">
              Commencez par votre premier dépôt pour activer votre épargne.
            </div>
          ) : (
            epargnes.map(ep => (
              <div key={ep.id} className="bg-card border border-border p-5 rounded-3xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">{ep.nom}</p>
                  <p className="text-2xl font-black text-emerald-600">{formatAmount(ep.montant_actuel, ep.devise)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ouvert le {new Date(ep.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => setShowRetrait(ep)} className="bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold rounded-xl">
                    Retirer (-10%)
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- MODAL DÉPÔT --- */}
      {showDepot && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom">
            <button onClick={() => setShowDepot(false)} className="absolute right-6 top-6 p-2 hover:bg-muted rounded-full">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black mb-6">Faire un dépôt</h2>
            <form onSubmit={handleDepot} className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">Montant à épargner</label>
                <div className="relative">
                  <Input type="number" value={formDepot.montant} onChange={e => setFormDepot({...formDepot, montant: e.target.value})} placeholder="Ex: 5000" className="h-14 pl-4 text-lg font-bold rounded-2xl" />
                  <span className="absolute right-4 top-4 font-black text-emerald-600">XOF</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                <ShieldCheck className="w-3 h-3 inline mr-1" /> Paiement sécurisé via API de paiement.
              </p>
              <Button type="submit" className="w-full bg-emerald-600 h-14 rounded-2xl font-black text-lg">Confirmer le dépôt</Button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL RETRAIT --- */}
      {showRetrait && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowRetrait(null)} className="absolute right-6 top-6 p-2 hover:bg-muted rounded-full">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black mb-2">Retrait d'argent</h2>
            <p className="text-sm text-amber-600 font-medium mb-6">Attention: 10% de frais seront appliqués.</p>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold mb-1 block">Montant du retrait</label>
                <Input type="number" value={formRetrait.montant} onChange={e => setFormRetrait({...formRetrait, montant: e.target.value})} placeholder="0.00" className="h-14 text-lg font-bold rounded-2xl" />
                {formRetrait.montant && (
                  <div className="mt-2 text-xs font-bold text-muted-foreground flex justify-between px-2">
                    <span>Frais (10%): -{formatAmount(parseFloat(formRetrait.montant)*0.1, showRetrait.devise)}</span>
                    <span className="text-emerald-600">Vous recevrez: {formatAmount(parseFloat(formRetrait.montant)*0.9, showRetrait.devise)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block">Réseau mobile</label>
                <select className="w-full h-14 rounded-2xl border border-input bg-background px-4 font-bold" 
                  value={formRetrait.reseau} onChange={e => setFormRetrait({...formRetrait, reseau: e.target.value})}>
                  <option value="">Choisir un réseau</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="MOOV">Moov Money</option>
                  <option value="ORANGE">Orange Money</option>
                  <option value="WAVE">Wave</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold mb-1 block">Numéro de téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                  <Input type="tel" value={formRetrait.numero} onChange={e => setFormRetrait({...formRetrait, numero: e.target.value})} placeholder="Numéro de retrait" className="h-14 pl-12 text-lg font-bold rounded-2xl" />
                </div>
              </div>

              <Button onClick={handleRetrait} className="w-full bg-amber-600 hover:bg-amber-700 h-14 rounded-2xl font-black text-lg mt-4">
                Retirer maintenant
              </Button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}
