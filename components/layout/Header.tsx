// src/components/layout/Header.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo and Site Name */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Coins className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            GMGN Clone
          </span>
        </Link>

        {/* Main Navigation */}
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/trade"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            交易
          </Link>
          <Link
            href="/copy-trading"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            跟单
          </Link>
          <Link
            href="/wallet"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            钱包
          </Link>
        </nav>

        {/* Right side Actions */}
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="secondary">登录</Button>
          <Button>注册</Button>
        </div>
      </div>
    </header>
  );
}