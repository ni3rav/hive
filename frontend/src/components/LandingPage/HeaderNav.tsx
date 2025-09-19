import { Button } from "@/components/ui/button";

type Props = {
  onLogin: () => void;
  onStart: () => void;
};

export function HeaderNav({ onLogin, onStart }: Props) {
  return (
    <header className="relative z-50 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <span className="text-black font-bold text-lg">🐝</span>
          </div>
          <span className="text-xl font-bold text-white">Hive</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="text-neutral-300 hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-neutral-300 hover:text-white transition-colors"
          >
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onLogin}
            className="text-neutral-300 hover:text-white"
          >
            Log in
          </Button>
          <Button
            onClick={onStart}
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold"
          >
            Start Publishing
          </Button>
        </div>
      </div>
    </header>
  );
}