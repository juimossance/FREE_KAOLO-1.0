import { ShieldCheck } from "lucide-react";

export function CertifiedBadge({
  label = "Certifié",
  size = "md",
}: { label?: string; size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold border ${
        sm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
      style={{ background: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" }}
      title="Vérifié par l'équipe free-kaolo"
    >
      <ShieldCheck size={sm ? 11 : 13} />
      {label}
    </span>
  );
}