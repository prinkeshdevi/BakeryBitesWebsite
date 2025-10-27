import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, errMsg: string): Promise<T> {
  let timer: any;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errMsg)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const upper = method.toUpperCase();
  const hasBody = data !== undefined && upper !== "GET" && upper !== "HEAD";
  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s safety timeout

  try {
    const res = await fetch(url, {
      method: upper,
      headers: hasBody && !isFormData ? { "Content-Type": "application/json" } : {},
      body: hasBody ? (isFormData ? (data as any) : JSON.stringify(data)) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    await throwIfResNotOk(res);
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
        signal: controller.signal,
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null as any;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
