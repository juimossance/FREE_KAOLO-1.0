// src/app/components/progress/ProgressGauge.tsx
//
// Signature visuelle du module "avancement" : un instrument à segments
// (façon vumètre / niveau de charge) plutôt qu'une barre arrondie à
// gradient. Chaque segment vaut 5%. Utilisé en lecture (entreprise)
// et en aperçu live pendant la saisie (freelancer).

interface ProgressGaugeProps {
  value: number; // 0-100
  segments?: number;
}

export function ProgressGauge({ value, segments = 20 }: ProgressGaugeProps) {
  const filled = Math.round((Math.max(0, Math.min(100, value)) / 100) * segments);

  return (
    <div className="flex items-center gap-[3px]" role="presentation">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="h-6 flex-1 rounded-[1px] transition-colors duration-300"
          style={{
            background: i < filled ? "var(--progress-accent)" : "var(--line)",
          }}
        />
      ))}
    </div>
  );
}