import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function isFormData(data) {
  return typeof FormData !== "undefined" && data instanceof FormData;
}

export async function apiRequest(method, url, data) {
  const init = {
    method,
    credentials: "include",
  };

  if (data !== undefined && data !== null) {
    if (isFormData(data)) {
      // Let the browser set the correct multipart/form-data headers with boundary
      init.body = data;
    } else {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(data);
    }
  }

  const res = await fetch(url, init);
  await throwIfResNotOk(res);

  // Try to parse JSON responses by default; fall back to text if not JSON
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    // If there's no body, return null
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  }

  // For non-JSON responses, return raw text
  return await res.text();
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) => {
  return async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/"), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };
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
