
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到交易页面
    router.replace("/trade");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <p className="text-muted-foreground">正在加载...</p>
        </div>
      </div>
    </main>
  );
}

