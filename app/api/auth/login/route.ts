// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  //  email 和 password 不为空即可
  if (!email || !password) {
    return NextResponse.json(
      { message: "邮箱或密码不能为空" },
      { status: 400 }
    );
  }

  // 根据 email 生成唯一的用户 ID
  const userId = `user-${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}`;
  
  const mockUser = {
    id: userId,
    email: email,
    name: email.split('@')[0],
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
  };

  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockUser);
}