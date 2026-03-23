"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Database, Activity, Trophy } from "lucide-react";
import GenderToggle from "@/app/components/GenderToggle";
import { useGender } from "@/app/components/Providers";

const MOCK_ADMIN = {
  name: "Admin User",
  role: "Super Admin",
  email: "admin@prism.com"
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { gender } = useGender();
  const genderLabel = gender === "f" ? "Women's" : "Men's";
  const navigation = [
    { name: `${genderLabel} Cricket`, href: "/admin/cricket", icon: LayoutDashboard },
    { name: `${genderLabel} Football`, href: "/admin/football", icon: Activity },
    { name: `${genderLabel} Badminton`, href: "/admin/badminton", icon: Activity },
    { name: `${genderLabel} Table Tennis`, href: "/admin/table-tennis", icon: Activity },
    { name: `${genderLabel} Lawn Tennis`, href: "/admin/lawn-tennis", icon: Activity },
    { name: `${genderLabel} Basketball`, href: "/admin/basketball", icon: Activity },
    { name: `${genderLabel} Volleyball`, href: "/admin/volleyball", icon: Activity },
    { name: `${genderLabel} Handball`, href: "/admin/handball", icon: Activity },
    { name: `${genderLabel} Kho-Kho`, href: "/admin/kho-kho", icon: Activity },
    { name: `${genderLabel} Athletics`, href: "/admin/athletics", icon: Activity },
    { name: `${genderLabel} Powersports`, href: "/admin/powersports", icon: Activity },
    { name: `${genderLabel} Tug Of War`, href: "/admin/tug-of-war", icon: Activity },
    { name: `${genderLabel} Arm Wrestling`, href: "/admin/arm-wrestling", icon: Activity },
    { name: `${genderLabel} Chess`, href: "/admin/chess", icon: Activity },
    { name: `${genderLabel} Carrom`, href: "/admin/carrom", icon: Activity },
    { name: "Homepage LB", href: "/admin/leaderboard", icon: Trophy },
    { name: "Cricket LB", href: "/admin/leaderboard/cricket", icon: Database },
    { name: "Football LB", href: "/admin/leaderboard/football", icon: Database },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setError("");
      sessionStorage.setItem("adminAuth", "true");
    } else {
      setError("Invalid admin password");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="glass p-8 md:p-12 rounded-3xl border border-zinc-800 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
          
          <div className="text-center mb-8">
            <h1 className="font-sports text-3xl tracking-wide glow-text">Admin Access</h1>
            <p className="text-zinc-500 mt-2 text-sm">Enter the master password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            {error && <p className="text-danger text-sm font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-accent text-white font-bold tracking-wider py-3 rounded-xl hover:bg-accent/80 transition-all hover:shadow-neon"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className={`w-64 border-r overflow-y-auto shadow-sm border-zinc-800 bg-card`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex-1">
            <h2 className={`text-xl font-bold glow-text mb-6`}>Admin Panel • {genderLabel}</h2>
            
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-accent/15 text-accent font-bold border-l-2 border-accent"
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <button
            onClick={() => {
              sessionStorage.removeItem("adminAuth");
              setIsAuthenticated(false);
              router.push("/");
            }}
            className={`mt-6 w-full px-4 py-3 rounded-lg border text-sm font-semibold transition-all text-left bg-zinc-900 border-zinc-800 hover:bg-danger/20 hover:text-danger hover:border-danger/50 text-white`}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-card/50 backdrop-blur flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold capitalize">
              {pathname.split('/').pop() || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Embedded Gender Toggle inside Admin Header */}
            <div className="scale-75 origin-right">
               <GenderToggle />
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold">A</span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{MOCK_ADMIN.name}</p>
                <p className="text-xs text-zinc-500">{MOCK_ADMIN.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-background relative">
          <div className="absolute inset-0 bg-accent/5 pointer-events-none" />
          <div className="relative z-10 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
