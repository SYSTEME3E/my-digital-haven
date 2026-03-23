// --- Dans BoutiqueAccueilPage.tsx ---
// Ajoute ces imports
import { ShieldCheck, Zap, Crown, Lock } from "lucide-react";
import { getNexoraUser, PLAN_LIMITS } from "@/lib/nexora-auth";

export default function BoutiqueAccueilPage() {
  const user = getNexoraUser();
  // ... tes states existants ...

  // Séparation Physique vs Digital
  const produitsPhysiques = produits.filter(p => p.type === 'physique' || !p.type).length;
  const produitsDigitaux = produits.filter(p => p.type === 'digital').length;

  return (
    <BoutiqueLayout boutiqueName={boutique?.nom} boutiqueSlug={boutique?.slug}>
      <div className="space-y-6">
        
        {/* BANNIÈRE ABONNEMENT DYNAMIQUE */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          user?.plan === 'roi' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-none' :
          user?.plan === 'boss' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none' :
          'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {user?.plan === 'roi' ? <Crown className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs opacity-80 font-bold uppercase tracking-wider">Plan Actuel</p>
              <h2 className="text-lg font-black capitalize">{user?.plan || 'Gratuit'}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold">Produits: {produits.length} / {PLAN_LIMITS[user?.plan || 'gratuit'].produits === Infinity ? '∞' : PLAN_LIMITS[user?.plan || 'gratuit'].produits}</p>
            <Button size="sm" variant="secondary" className="h-7 text-[10px] mt-1 bg-white text-black hover:bg-gray-100">
              Changer de plan
            </Button>
          </div>
        </div>

        {/* Section Types de Produits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute -right-2 -bottom-2 opacity-5">
                <Package className="w-16 h-16" />
             </div>
             <p className="text-xs text-gray-500 font-bold uppercase">Boutique Physique</p>
             <p className="text-2xl font-black text-gray-800">{produitsPhysiques}</p>
             <p className="text-[10px] text-gray-400">Articles en stock réel</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
             <div className="absolute -right-2 -bottom-2 opacity-5 text-pink-600">
                <Zap className="w-16 h-16" />
             </div>
             <p className="text-xs text-gray-500 font-bold uppercase">Boutique Digitale</p>
             <p className="text-2xl font-black text-pink-600">{produitsDigitaux}</p>
             <p className="text-[10px] text-gray-400">Services, PDF, Formations</p>
          </div>
        </div>

        {/* ... Le reste de tes stats (Commandes, Revenus, etc.) ... */}
        
        {/* ALERTE LIMITE (Si presque plein) */}
        {produits.length >= PLAN_LIMITS[user?.plan || 'gratuit'].produits && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3">
            <Lock className="w-5 h-5 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">Limite atteinte !</p>
              <p className="text-xs text-red-600">Passez au plan **BOSS** pour ajouter jusqu'à 20 produits.</p>
            </div>
          </div>
        )}

      </div>
    </BoutiqueLayout>
  );
}
