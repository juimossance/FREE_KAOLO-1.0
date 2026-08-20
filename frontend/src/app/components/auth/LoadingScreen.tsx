// src/components/LoadingScreen.tsx
export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-2 border-t-transparent rounded-full"
           style={{ borderColor: "var(--navy)", borderTopColor: "transparent" }} />
    </div>
  );
}