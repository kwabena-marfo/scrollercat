"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BsEnvelope, BsEye, BsEyeSlash, BsLock } from "react-icons/bs";
import { LuLoader2 } from "react-icons/lu";

import { authClient } from "@/lib/authClient";
import { loginSchema, type LoginForm } from "@/schemas/admin";

import Logo from "@/components/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isHidePass, setIsHidePass] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), mode: "onTouched" });

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await authClient.signIn.email({ email: data.email, password: data.password });
      if (result?.error) {
        setErrorMsg(result.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }
      // Only same-site paths — never an absolute URL from the query string.
      const next = searchParams?.get("next") || "";
      router.push(next.startsWith("/admin") ? next : "/admin");
    } catch {
      setErrorMsg("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6 py-10">
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <Link href="/" className="mx-auto">
            <Logo size={40} />
          </Link>
          <CardTitle className="text-xl font-black">Store admin</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to manage orders and products</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <BsEnvelope className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="pl-10"
                  error={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <BsLock className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="password"
                  type={isHidePass ? "password" : "text"}
                  autoComplete="current-password"
                  className="pl-10 pr-10"
                  error={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setIsHidePass(!isHidePass)}
                  className="absolute right-3 top-3 text-muted-foreground"
                  aria-label={isHidePass ? "Show password" : "Hide password"}
                >
                  {isHidePass ? <BsEyeSlash /> : <BsEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
            {errorMsg && <p className="text-center text-xs text-red-500">{errorMsg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
