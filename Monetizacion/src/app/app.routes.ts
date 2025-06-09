import type { Routes } from "@angular/router"
import { AuthComponent } from "./components/auth/auth.component"
import { DashboardComponent } from "./components/dashboard/dashboard.component"
import { SubscriptionComponent } from "./components/subscription/subscription.component"

export const routes: Routes = [
  { path: "", redirectTo: "/auth", pathMatch: "full" },
  { path: "auth", component: AuthComponent },
  { path: "dashboard", component: DashboardComponent },
  { path: "subscription", component: SubscriptionComponent },
  { path: "**", redirectTo: "/auth" },
]
