// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Coins, LogOut } from "lucide-react";
import { Users } from "lucide-react";
import { useCopyTrading } from "@/context/CopyTradingContext";
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
  const { isAuthenticated, user, account, logout } = useAuth();
  const { followingList, stopFollowing } = useCopyTrading();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Coins className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              ZYZS
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/market" className="text-foreground/60 transition-colors hover:text-foreground/80">
              市场
            </Link>
            <Link href="/trade" className="text-foreground/60 transition-colors hover:text-foreground/80">
              交易
            </Link>
            <Link href="/copy-trading" className="text-foreground/60 transition-colors hover:text-foreground/80">
              跟单
            </Link>
            {isAuthenticated && (
              <Link href="/wallet" className="text-foreground/60 transition-colors hover:text-foreground/80">
                钱包
              </Link>
            )}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {isAuthenticated && account && (
              <div className="text-sm text-muted-foreground">
                余额: ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </div>
            )}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>正在跟单 ({followingList.length})</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {followingList.length > 0 ? (
                    followingList.map(f => (
                      <DropdownMenuItem key={f.traderId} onClick={() => stopFollowing(f.traderId)}>
                        {f.traderName} - ${f.amount} <span className="ml-2 text-xs text-muted-foreground">(取消)</span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>暂无跟单</DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>登出</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="secondary" onClick={() => setIsAuthDialogOpen(true)}>登录</Button>
                <Button onClick={() => setIsAuthDialogOpen(true)}>注册</Button>
              </div>
            )}

            <div className="md:hidden">
              <Button variant="ghost" onClick={() => setIsMobileMenuOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-background p-6 shadow-lg overflow-auto">
            <div className="flex items-center justify-between mb-6">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                <Coins className="h-6 w-6" />
                <span className="font-bold">ZYZS</span>
              </Link>
              <Button variant="ghost" onClick={() => setIsMobileMenuOpen(false)}>关闭</Button>
            </div>
            <nav className="grid gap-4 text-lg">
              <Link href="/market" onClick={() => setIsMobileMenuOpen(false)} className="py-2">市场</Link>
              <Link href="/trade" onClick={() => setIsMobileMenuOpen(false)} className="py-2">交易</Link>
              <Link href="/copy-trading" onClick={() => setIsMobileMenuOpen(false)} className="py-2">跟单</Link>
              {isAuthenticated && (
                <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="py-2">钱包</Link>
              )}
            </nav>
            {!isAuthenticated && (
              <div className="mt-6 grid gap-3">
                <Button variant="secondary" onClick={() => { setIsAuthDialogOpen(true); setIsMobileMenuOpen(false); }}>登录</Button>
                <Button onClick={() => { setIsAuthDialogOpen(true); setIsMobileMenuOpen(false); }}>注册</Button>
              </div>
            )}

            {isAuthenticated && (
              <div className="mt-6">
                <div className="text-sm text-muted-foreground mb-2">正在跟单 ({followingList.length})</div>
                {followingList.length > 0 ? (
                  followingList.map(f => (
                    <div key={f.traderId} className="flex items-center justify-between py-2">
                      <div className="text-sm">{f.traderName}</div>
                      <Button variant="ghost" size="sm" onClick={() => { stopFollowing(f.traderId); }}>{/* small cancel */}取消</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">暂无跟单</div>
                )}
                <div className="mt-4">
                  <Button variant="ghost" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>登出</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}