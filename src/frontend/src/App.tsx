import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import OnlineReactivationPage from "./pages/OnlineReactivationPage";
import PublicationListPage from "./pages/PublicationListPage";
import ReactivationPortalPage from "./pages/ReactivationPortalPage";
import StaffActivatedPage from "./pages/StaffActivatedPage";
import StaffFollowupsPage from "./pages/StaffFollowupsPage";
import StaffLoginPage from "./pages/StaffLoginPage";
import StaffPrintPage from "./pages/StaffPrintPage";
import StaffReactivationsPage from "./pages/StaffReactivationsPage";

const rootRoute = createRootRoute({ component: () => <Outlet /> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: PublicationListPage,
});

const reactivationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reactivation",
  component: ReactivationPortalPage,
});

const onlineReactivationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reactivate",
  component: OnlineReactivationPage,
});

const staffLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/login",
  component: StaffLoginPage,
});

const staffFollowupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/followups",
  component: StaffFollowupsPage,
});

const staffReactivationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/reactivations",
  component: StaffReactivationsPage,
});

const staffActivatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/activated",
  component: StaffActivatedPage,
});

const staffPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/staff/print/$id",
  component: StaffPrintPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  reactivationRoute,
  onlineReactivationRoute,
  staffLoginRoute,
  staffFollowupsRoute,
  staffReactivationsRoute,
  staffActivatedRoute,
  staffPrintRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="bawjiase-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
