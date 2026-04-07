"use client";

import { Suspense, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SuspenseWrapper({ children }: { children: (searchParams: URLSearchParams) => React.ReactNode }) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children(searchParams)}</>;
}

export function withSearchParams<T extends object>(Component: React.ComponentType<T & { searchParams: URLSearchParams }>) {
  return function WithSearchParamsWrapper(props: Omit<T, "searchParams">) {
    return (
      <Suspense fallback={null}>
        <Component {...(props as T)} searchParams={useSearchParams()} />
      </Suspense>
    );
  };
}
