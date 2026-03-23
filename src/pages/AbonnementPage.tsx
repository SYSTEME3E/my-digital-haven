import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import BoutiqueLayout from "@/components/BoutiqueLayout";
import {
  ShoppingBag, Package, TrendingUp, Clock,
  CheckCircle, Truck, XCircle, BarChart2,
  ShieldCheck, Zap, Crown, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNexoraUser, PLAN_LIMITS } from "@/lib/nexora-auth";

type Periode = "jour" | "semaine" | "mois";

export default function BoutiqueAccueilPage() {
  const user = getNexoraUser();
  const [boutique, setBoutique] = useState<any>(null);
  const [commandes, setCommandes] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState<Periode>("semaine");

  // --- Sécurisation du Plan et des Limites ---
  const planBrut = user?.plan || 'gratuit';
  const planActuel = planBrut.toLowerCase() as 'gratuit' | 'boss' | 'roi';
  const limites = PLAN_LIMITS[planActuel] || PLAN_LIMITS['gratuit'];

  const load = async () => {
    setLoading(true);
    try {
      const { data: b } = await supabase
        .from("boutiques" as any).select("*").limit(1).single();
      
      if (b) {
        setBoutique(b);
        const [cmds, prods] = await Promise.all([
          supabase.from("commandes" as any).select("*, articles_commande(*)").eq("boutique_id", b.id).order("created_at", { ascending: false }),
          supabase.from("produits" as any).select("*").eq("boutique_id", b.id)
        ]);
        setCommandes(cmds.data || []);
        setProduits(prods.data || []);
      }
    } catch (err) {
      console.error("Erreur de chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // --- Logique de filtrage ---
  const filtrerParPeriode = (liste: any[]) => {
    const now = new Date();
    return liste.filter(c => {
      const date = new Date(c.created_at);
      if (periode === "jour") return date.toDateString() === now.toDateString();
      if (periode === "semaine") return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  };

  const commandesFiltrees = filtrerParPeriode(commandes);
  const totalMontant = commandesFiltrees.reduce((sum, c) => sum + (c.total || 0), 0);
  const parStatut = (statut: string) => commandes.filter(c => c.statut === statut).length;

  // --- Séparation Physique vs Digital ---
  const produitsPhysiques = produits.filter(p => p.type === 'physique' || !p.type).length;
  const produitsDigitaux = produits.filter(p => p.type === 'digital').length;
  const totalProduits = produits.length;
  const limiteAtteinte = totalProduits >= limites.produits;

  if (loading) return (
    <BoutiqueLayout boutiqueName={boutique?.nom}>
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </BoutiqueLayout>
  );

  return (
    <BoutiqueLayout boutiqueName={boutique?.nom} boutiqueSlug={boutique?.slug}>
      <div className="space-y-6 pb-20 px-1">
        
        {/* HEADER & FILTRE */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">Ma Boutique</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tableau de Bord</p>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(["jour", "semaine", "mois"] as Periode[]).map(p => (
              <button key={p} onClick={() => setPeriode(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all capitalize ${
                  periode === p ? "bg-white text-pink-600 shadow-sm" : "text-gray-500"
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* BANNIÈRE ABONNEMENT DYNAMIQUE (CORRIGÉE) */}
        <div className={`p-5 rounded-[2rem] flex items-center justify-between relative overflow-hidden transition-all ${
          planActuel === 'roi' ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-white border-none shadow-xl shadow-yellow-100' :
          planActuel === 'boss' ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-none shadow-xl shadow-blue-100' :
          'bg-white border border-gray-100 shadow-sm'
        }`}>
          <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-2xl ${planActuel === 'gratuit' ? 'bg-gray-100' : 'bg-white/20'}`}>
              {planActuel === 'roi' ? <Crown className="w-6 h-6" /> : <Zap className={`w-6 h-6 ${planActuel === 'gratuit' ? 'text-gray-400' : ''}`} />}
            </div>
            <div>
              <p className="text-[10px] opacity-70 font-black uppercase tracking-widest leading-none mb-1">Plan de la Boutique</p>
              <h2 className="text-xl font-black capitalize tracking-tight">{planActuel}</h2>
            </div>
          </div>
          <div className="text-right relative z-10">
            <p className="text-[10px] font-black">Produits: {totalProduits} / {limites.produits === Infinity ? '∞' : limites.produits}</p>
            <Button size="sm" className="h-7 text-[9px] mt-2 bg-white text-black hover:bg-gray-100 font-black rounded-full shadow-lg border-none">
              CHANGER
            </Button>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10">
             {planActuel === 'roi' ? <Crown className="w-24 h-24" /> : <ShieldCheck className="w-24 h-24" />}
          </div>
        </div>

        {/* ALERTE LIMITE (CORRIGÉE) */}
        {limiteAtteinte && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 border-l-4 border-l-red-500">
            <Lock className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-xs font-black text-red-700 uppercase">Limite atteinte !</p>
              <p className="text-[10px] text-red-600 font-medium">Passez au plan **BOSS** pour ajouter plus de produits.</p>
            </div>
          </div>
        )}

        {/* SECTION TYPES DE PRODUITS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute -right-2 -bottom-2 opacity-5"><Package className="w-16 h-16" /></div>
             <p className="text-[10px] text-gray-400 font-black uppercase">Physique</p>
             <p className="text-3xl font-black text-gray-800">{produitsPhysiques}</p>
             <p className="text-[9px] text-gray-400 font-bold mt-1 tracking-tight">Stocks en boutique</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute -right-2 -bottom-2 opacity-5 text-pink-600"><Zap className="w-16 h-16" /></div>
             <p className="text-[10px] text-gray-400 font-black uppercase">Digitale</p>
             <p className="text-3xl font-black text-pink-600">{produitsDigitaux}</p>
             <p className="text-[9px] text-gray-400 font-bold mt-1 tracking-tight">PDF & Formations</p>
          </div>
        </div>

        {/* STATS FINANCIÈRES */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-4 h-4 text-pink-600" />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase">Commandes</p>
            <p className="text-3xl font-black text-gray-800">{commandesFiltrees.length}</p>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-[10px] text-gray-500 font-black uppercase">Revenus</p>
            <p className="text-2xl font-black text-gray-800 leading-none">
              {Math.round(totalMontant).toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-400 font-bold mt-1">{boutique?.devise || "FCFA"}</p>
          </div>
        </div>

        {/* GRAPH PERFORMANCE */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-pink-500" />
            <p className="font-black text-gray-800 text-xs uppercase tracking-widest">Activité 7 jours</p>
          </div>
          <div className="flex items-end gap-3 h-32">
            {[6,5,4,3,2,1,0].map((i) => {
               const date = new Date();
               date.setDate(date.getDate() - i);
               const cmdsJour = commandes.filter(c => new Date(c.created_at).toDateString() === date.toDateString());
               const montantJour = cmdsJour.reduce((sum, c) => sum + (c.total || 0), 0);
               const hauteur = Math.max((montantJour / (totalMontant || 1)) * 100, 8);
               
               return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-xl bg-pink-50 relative overflow-hidden h-full">
                    <div className="absolute bottom-0 left-0 right-0 bg-pink-500 opacity-80 rounded-t-xl transition-all"
                         style={{ height: `${hauteur}%` }} />
                  </div>
                  <span className="text-[8px] text-gray-400 font-black uppercase">
                    {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </span>
                </div>
               );
            })}
          </div>
        </div>

      </div>
    </BoutiqueLayout>
  );
}
