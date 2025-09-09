import { Navbar } from "./Navbar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative">
        {children}
      </main>
    </div>
  );
};