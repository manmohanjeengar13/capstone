export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background hero-glow bg-grid flex items-center justify-center p-4">
      {children}
    </div>
  );
}
