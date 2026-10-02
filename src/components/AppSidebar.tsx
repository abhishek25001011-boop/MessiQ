import {
  LayoutDashboard,
  UtensilsCrossed,
  BrainCircuit,
  ChefHat,
  MessageSquare,
  Recycle,
  IndianRupee,
  LogOut,
  User,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Meal Selection",
    url: "/meals",
    icon: UtensilsCrossed,
  },
  {
    title: "AI Predictions",
    url: "/predictions",
    icon: BrainCircuit,
  },
  {
    title: "Admin Panel",
    url: "/admin",
    icon: ChefHat,
  },
  {
    title: "Feedback",
    url: "/feedback",
    icon: MessageSquare,
  },
  {
    title: "Waste Dashboard",
    url: "/waste",
    icon: Recycle,
  },
  {
    title: "Revenue",
    url: "/revenue",
    icon: IndianRupee,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      setIsAdmin(false);
      if (user) {
        unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (profile) => {
          if (auth.currentUser?.uid === user.uid) {
            setIsAdmin(profile.exists() && profile.data().role === "admin");
          }
        }, (error) => console.error("Failed to load navigation role:", error));
      }
    });
    return () => {
      unsubscribeProfile?.();
      unsubscribeAuth();
    };
  }, []);

  const collapsed = state === "collapsed";
  const visibleNavItems = navItems.filter((item) => item.url !== "/admin" || isAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>

        <div className="px-4 py-6">
          {!collapsed ? (
            <div className="flex items-center gap-2">

              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
              </div>

              <div>
                <h1 className="font-display font-bold text-sm text-sidebar-primary">
                  MessIQ
                </h1>

                <p className="text-[10px] text-sidebar-foreground/60">
                  Smart Mess, Smarter Living
                </p>
              </div>

            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center mx-auto">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
        </div>

        <SidebarGroup>

          <SidebarGroupContent>

            <SidebarMenu>

              {visibleNavItems.map((item) => (

                <SidebarMenuItem key={item.title}>

                  <SidebarMenuButton asChild>

                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent/80 transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />

                      {!collapsed && (
                        <span>{item.title}</span>
                      )}

                    </NavLink>

                  </SidebarMenuButton>

                </SidebarMenuItem>

              ))}

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4">

        <SidebarMenuButton
          onClick={async () => {
            try {
              await signOut(auth);
              window.location.href = "/login";
            } catch (error) {
              console.error("Failed to sign out:", error);
              toast.error("Could not sign out. Please try again.");
            }
          }}
          className="hover:bg-sidebar-accent/80"
        >
          <LogOut className="mr-2 h-4 w-4" />

          {!collapsed && (
            <span>Logout</span>
          )}

        </SidebarMenuButton>

      </SidebarFooter>

    </Sidebar>
  );
}
