import Logo from "@/components/Logo";
import { NavbarDemo } from "@/components/NavBarDemo";
import { ModeToggle } from "@/components/ThemeModeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1 min-h-screen">
        <header className="flex items-center justify-between px-6 py-8 h-[80px]">
          <div>
            <Logo />
          </div>
          <NavbarDemo />
          <div className="gap-5 flex items-center pr-5">
            <ModeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="default" size="default">
                  Sign in
                </Button>
              </Link>
            </SignedOut>
          </div>
        </header>
        <Separator />
        <div className="p-[1rem]">
          <div className="flex-1 py-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default layout;
