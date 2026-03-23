import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getNexoraUser } from "@/lib/nexora-auth";
import { 
  ShieldCheck, Wallet, ArrowUpRight, ArrowDownLeft, 
  Lock, AlertTriangle, FileText, TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// --- Données simulées pour le graphique (À remplacer par des données réelles plus tard) ---
const genererDonneesGraphique = () => {
  const donnees = [];
  const maintenant = new Date();
  let soldeSimule = 15000; // Solde de départ il y a 30 jours

  for (let i = 30; i >= 0; i--) {
    const date = new Date(maintenant);
    date.setDate(maintenant.getDate() - i);
    
    // Simulation de variations (dépôts aléatoires)
    if (Math.random() > 0.7) {
        soldeSimule += Math.floor(Math.random() * 5000) + 1000;
    }

    donnees.push({
      date: date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      solde: soldeSimule,
    });
  }
  return donnees;
};

const donneesGraphique = genererDonneesGraphique();
const soldeActuelBase = donneesGraphique[donneesGraphique.length - 1].solde;
const maxSolde = Math.max(...donneesGraphique.map(d => d.solde), 1);


export default function EpargneNexoraPage() {
  const user = getNexoraUser();
  const [montant, setMontant] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"depot" | "retrait">("depot");
  const [accepteContrat, setAccepteContrat] = useState(false);
  const [soldeActuel, setSoldeActuel] = useState(soldeActuelBase); // Utilise la simulation pour l'instant

  // --- LOGIQUE DE RETRAIT AVEC PÉNALITÉ DE 10% ---
  const handleRetrait = async () => {
    if (!montant || Number(montant) < 100) {
      toast.error("Le minimum de retrait est de 100 XOF");
      return;
    }

    if (Number(montant) > soldeActuel) {
        toast.error("Solde insuffisant dans votre coffre-fort.");
        return;
    }

    const penalite = Number(montant) * 0.10;
    const montantFinal = Number(montant) - penalite;

    setLoading(true);
    try {
      // Logique d'insertion Database (Simulation ici, à relier à ta table réelle)
      /*
      const { error } = await supabase.from("transactions_epargne").insert({
        user_id: user?.id,
        montant: Number(montant),
        montant_net: montantFinal,
        type: "retrait",
        statut: "termine"
      });
      if (error) throw error;
      */

      // Mise à jour locale du solde (simulation)
      setSoldeActuel(prev => prev - Number(montant));

      toast.success(`Retrait réussi ! ${penalite.toLocaleString()} FCFA de pénalité appliqués (10%).`);
      setMontant("");
    } catch (err) {
      toast.error("Erreur lors du retrait. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIQUE DE DÉPÔT (SIMULATION) ---
  const handleDepot = async () => {
    if (!montant || Number(montant) < 300) {
        toast.error("Le minimum de dépôt est de 300 XOF");
        return;
    }
    setLoading(true);
    try {
        // Simulation de dépôt
        setSoldeActuel(prev => prev + Number(montant));
        toast.success(`Dépôt de ${Number(montant).toLocaleString()} FCFA réussi !`);
        setMontant("");
    } catch (err) {
        toast.error("Erreur lors du dépôt.");
    } finally {
        setLoading(false);
    }
  };


  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      
      {/* CARD SOLDE ÉPARGNE */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Lock className="w-24 h-24" />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Coffre-Fort Nexora</p>
        <h2 className="text-4xl font-black mt-2">{soldeActuel.toLocaleString()} <span className="text-lg text-slate-500 uppercase">FCFA</span></h2>
        
        <div className="flex gap-3 mt-8">
          <Button 
            onClick={() => setView("depot")}
            className={`flex-1 h-12 rounded-2xl border-none transition-all ${view === 'depot' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" /> Déposer
          </Button>
          <Button 
            onClick={() => setView("retrait")}
            className={`flex-1 h-12 rounded-2xl border-none transition-all ${view === 'retrait' ? 'bg-pink-600 text-white' : 'bg-white/10 text-white'}`}
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" /> Retirer
          </Button>
        </div>
      </div>

      {/* --- GRAPHIQUE D'ÉVOLUTION (30 JOURS) --- */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">Évolution (30 derniers jours)</h3>
        </div>
        <div className="flex items-end gap-1 h-28 w-full border-b border-gray-100 pb-1">
            {donneesGraphique.map((d, i) => {
                const hauteurPourcentage = (d.solde / maxSolde) * 100;
                // Afficher seulement quelques labels pour ne pas surcharger
                const afficherLabel = i === 0 || i === 14 || i === donneesGraphique.length - 1;

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        {/* Barre */}
                        <div 
                            className="w-full bg-blue-100 rounded-t-sm group-hover:bg-blue-500 transition-colors relative"
                            style={{ height: `${hauteurPourcentage}%` }}
                        >
                            {/* Tooltip au survol */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none transition-opacity">
                                {d.date} : {d.solde.toLocaleString()} FCFA
                            </div>
                        </div>
                        {/* Label Date (caché par défaut, affiché pour certains) */}
                        <span className={`text-[8px] text-gray-400 font-medium ${afficherLabel ? 'opacity-100' : 'opacity-0'}`}>
                            {d.date}
                        </span>
                    </div>
                );
            })}
        </div>
      </div>


      {/* FORMULAIRE DÉPÔT / RETRAIT */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-800 text-lg">
            {view === "depot" ? "Alimenter mon épargne" : "Récupérer mes fonds"}
          </h3>
          {view === "retrait" && (
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> -10% PÉNALITÉ
            </span>
          )}
        </div>
        
        <div className="space-y-5">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Montant à {view === "depot" ? "épargner" : "retirer"}</label>
            <Input 
              type="number" 
              placeholder={view === "depot" ? "Minimum 300 FCFA" : "Minimum 100 FCFA"}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="mt-1 rounded-2xl border-gray-100 bg-gray-50 h-14 text-xl font-black focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {view === "retrait" && montant && Number(montant) >= 100 && (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-[11px] text-orange-700 font-medium">
                Vous recevrez : <span className="font-bold">{(Number(montant) * 0.9).toLocaleString()} FCFA</span>
                <br />
                Pénalité de 10% : <span className="font-bold">{(Number(montant) * 0.1).toLocaleString()} FCFA</span>
              </p>
            </div>
          )}

          <Button 
            onClick={view === "depot" ? handleDepot : handleRetrait} // Correction ici pour gérer les deux actions
            disabled={!accepteContrat || Number(montant) < (view === "depot" ? 300 : 100) || loading}
            className={`w-full h-14 rounded-2xl font-black text-lg shadow-lg ${view === 'depot' ? 'bg-black hover:bg-slate-800' : 'bg-pink-600 hover:bg-pink-700'}`}
          >
            {loading ? "Traitement..." : view === "depot" ? "Confirmer le dépôt" : "Valider le retrait"}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            Transaction sécurisée par Nexora Cloud
          </div>
        </div>
      </div>

      {/* --- LE CONTRAT D'ÉPARGNE (TEXTE INTÉGRAL) --- */}
      <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">🔐 CONTRAT D’ÉPARGNE NEXORA</h3>
        </div>

        <div className="space-y-4 text-[12px] leading-relaxed text-gray-600">
          <p>Bienvenue chez <strong>NEXORA</strong>.</p>
          <p>En accédant à cette fonctionnalité d’épargne, vous choisissez de faire un pas vers une meilleure gestion de vos finances.</p>

          <div className="space-y-2">
            <p className="font-black text-gray-800 uppercase text-[10px]">📌 Engagement de l’utilisateur</p>
            <p>
              En utilisant le service d’épargne NEXORA, vous acceptez de déposer volontairement des fonds dans votre espace sécurisé. Ces fonds restent votre propriété exclusive.
            </p>
            <p>Vous reconnaissez que ce service est conçu pour vous aider à :</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Développer une discipline financière</li>
              <li>Atteindre vos objectifs personnels</li>
              <li>Sécuriser vos économies</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-black text-gray-800 uppercase text-[10px]">💰 Accès et retrait des fonds</p>
            <p>Vous pouvez retirer votre argent à tout moment, sans restriction.</p>
            <div className="bg-red-50 p-3 rounded-xl border-l-4 border-red-500">
              <p className="text-red-700 font-bold">
                ➡️ Une pénalité de 10% sera appliquée sur tout montant retiré.
              </p>
              <p className="text-[11px] mt-1 text-red-600">
                Cette mesure vise à renforcer votre engagement envers vos objectifs financiers et éviter les retraits impulsifs.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-black text-gray-800 uppercase text-[10px]">🔒 Sécurité et responsabilité</p>
            <p>NEXORA met en œuvre des mesures de sécurité avancées pour protéger vos fonds et vos données.</p>
            <p>Toutefois, en utilisant ce service, you acceptez que :</p>
            <ul className="list-disc ml-5">
              <li>Vous êtes responsable de vos décisions financières</li>
              <li>Vous utilisez cette fonctionnalité de manière consciente et volontaire</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={accepteContrat}
                onChange={(e) => setAccepteContrat(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-[11px] font-bold text-gray-800 group-hover:text-black transition-colors">
                J'ACCEPTE LE CONTRAT : Je confirme avoir lu et compris les conditions et m'engage à respecter les règles du service d'épargne NEXORA.
              </span>
            </label>
          </div>
        </div>
      </div>

    </div>
  );
}
