// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Coins, LogOut } from "lucide-react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
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
            <Link href="/trade" className="text-foreground/60 transition-colors hover:text-foreground/80">
              交易
            </Link>
            <Link href="/copy-trading" className="text-foreground/60 transition-colors hover:text-foreground/80">
              跟单
            </Link>
            {isAuthenticated && ( // 仅在登录后显示钱包
              <Link href="/wallet" className="text-foreground/60 transition-colors hover:text-foreground/80">
                钱包
              </Link>
            )}
          </nav>

          {/* Right side Actions */}
          <div className="flex flex-1 items-center justify-end space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>我的账户</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>个人中心</DropdownMenuItem>
                  <DropdownMenuItem>设置</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>登出</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={() => setIsAuthDialogOpen(true)}>登录</Button>
                <Button onClick={() => setIsAuthDialogOpen(true)}>注册</Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}