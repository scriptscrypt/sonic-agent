import { AgentLogo } from "@/components/layout/AgentLogo";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Shared Chat - Espio",
  description: "View a shared chat from Espio",
};

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-10 flex items-center px-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-semibold">
                <AgentLogo />
              </span>
            </div>
            <span className="font-semibold">Espio</span>
          </div>
          <div className="text-sm text-muted-foreground">Shared Chat</div>
        </div>
      </div>
      <div className="pt-16">{children}</div>
    </div>
  );
}
