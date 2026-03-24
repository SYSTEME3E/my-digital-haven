import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { getNexoraUser, PLAN_LIMITS, type NexoraPlan } from "@/lib/nexora-auth";
import { Crown, Zap, Check, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PLANS = [
  {
    id: "gratuit" as NexoraPlan,
    nom: "Gratuit",
    prix: "0",
    devise: "FCFA",
    periode: "",
    description: "Pour commencer avec les fonctionnalités de base",
    icon: ShieldCheck,
    color: "from-gray-400 to-gray-500",
    features: [
      "5 entrées / dépenses",
      "10 factures",
      "2 prêts / dettes",
      "5 produits boutique",
      "Coffre-fort (limité)",
      "Tableau de bord basique",
    ],
  },
  {
    id: "boss" as NexoraPlan,
    nom: "BOSS",
    prix: "6 200",
    devise: "FCFA",
    periode: "/mois",
    description: "Pour les entrepreneurs ambitieux",
    icon: Zap,
    color: "from-blue-600 to-indigo-700",
    popular: true,
    features: [
      "100 entrées / dépenses",
      "100 factures",
      "10 prêts / dettes",
      "20 produits boutique",
      "Coffre-fort illimité",
      "Épargne avec contrat",
      "Marché immobilier",
      "Nexora Transfert",
      "Badge vérifié",
    ],
  },
  {
    id: "roi" as NexoraPlan,
    nom: "ROI",
    prix: "12 400",
    devise: "FCFA",
    periode: "/mois",
    description: "Accès illimité à tout NEXORA",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    features: [
      "Tout illimité",
      "Produits boutique illimités",
      "Factures illimitées",
      "Prêts illimités",
      "Épargne + retraits",
      "Boutique physique & digitale",
      "Support prioritaire",
      "Badge premium doré",
      "Accès anticipé nouveautés",
    ],
  },
];

export default function AbonnementPage() {
  const navigate = useNavigate();
  const user = getNexoraUser();
  const currentPlan = user?.plan || "gratuit";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-foreground">Choisissez votre plan</h1>
          <p className="text-muted-foreground text-sm">
            1$ = 620 FCFA • Annulez à tout moment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-card border rounded-2xl p-6 flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-brand-lg ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-black px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> POPULAIRE
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-black text-foreground">{plan.nom}</h3>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-foreground">{plan.prix}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.devise}{plan.periode}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full mt-6 font-bold ${
                    isCurrent
                      ? "bg-muted text-muted-foreground cursor-default"
                      : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                  }`}
                  disabled={isCurrent}
                  onClick={() => {
                    if (!isCurrent) {
                      // TODO: intégrer API de paiement
                      navigate("/dashboard");
                    }
                  }}
                >
                  {isCurrent ? "Plan actuel" : `Passer à ${plan.nom}`}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          <p>Les paiements seront gérés via l'API de paiement sécurisée.</p>
          <p className="mt-1">En cas de question, contactez le support NEXORA.</p>
        </div>
      </div>
    </AppLayout>
  );
}
