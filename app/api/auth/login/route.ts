// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // 模拟验证：只要 email 和 password 不为空即可
  if (!email || !password) {
    return NextResponse.json(
      { message: "邮箱或密码不能为空" },
      { status: 400 }
    );
  }

  // 模拟成功登录，返回一个固定的用户信息
  const mockUser = {
    id: "user-123",
    email: email,
    name: "虚拟用户",
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
  };

  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockUser);
}