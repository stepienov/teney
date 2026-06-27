import type { ReactNode } from "react";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScreen({ title, subtitle, children }: AuthScreenProps) {
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      </header>
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
