import { Button } from "@/components/ui/button";
import { NavMenu } from "@/components/nav-menu";
import { NavigationSheet } from "@/components/navigation-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b">
      <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-12">
          <div className="flex items-center justify-center p-2">
            <Image
              src="/hive.png"
              alt="Hive Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>

          {/* Desktop Menu */}
          <NavMenu className="hidden md:block" />
        </div>

        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="https://app.hivecms.online">Get Started</Link>
          </Button>
          <ThemeToggle />

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
