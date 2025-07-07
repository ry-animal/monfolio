import Header from "@/components/header";
import Loader from "@/components/loader";
import { ThemeProvider } from "@/components/theme-provider";
import { Web3Provider } from "@/components/web3-provider";
import { Toaster } from "@/components/ui/sonner";
import type { trpc } from "@/utils/trpc";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "../index.css";

export interface RouterAppContext {
  trpc: typeof trpc;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "Monfolio",
      },
      {
        name: "description",
        content: "Monfolio",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/LMark.png",
      },
    ],
  }),
});

function RootComponent() {
  const isFetching = useRouterState({
    select: (s) => s.isLoading,
  });


  return (
    <>
      <HeadContent />
      <Web3Provider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div
            className="fixed inset-0 z-0 bg-background"
            style={{
              backgroundImage: `url('/N&T.png'), url('/LS.png'), url('/SS.png')`,
              backgroundRepeat: 'repeat, no-repeat, no-repeat',
              backgroundPosition: '0 0, 0 0, 100% 150%',
              backgroundSize: 'auto, contain, 40%',
            }}
          />
          <div className="relative z-10 grid h-svh grid-rows-[auto_1fr]">
            <Header />
            {isFetching ? <Loader /> : <Outlet />}
          </div>
          <Toaster richColors />
        </ThemeProvider>
      </Web3Provider>
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
