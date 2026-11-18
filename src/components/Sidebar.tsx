import {
  Activity,
  Bot,
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  LayoutDashboard,
  Lightbulb,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';

export type SidebarNavId =
  | 'overview'
  | 'live'
  | 'compare'
  | 'forecast'
  | 'assistant'
  | 'insights'
  | 'settings';

interface SidebarProps {
  activeNav: SidebarNavId;
  onSelectNav: (id: SidebarNavId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: SidebarNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'live', label: 'Live Air Quality', icon: Activity },
  { id: 'compare', label: 'City Comparison', icon: GitCompareArrows },
  { id: 'forecast', label: 'Forecast & Trends', icon: TrendingUp },
  { id: 'assistant', label: 'AI Health Assistant', icon: Bot },
  { id: 'insights', label: 'Pollution Insights', icon: Lightbulb },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function BrandMark() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="9" fill="#0F766E" />
      <circle cx="16" cy="16" r="8.5" stroke="#BAE6FD" strokeWidth="1.75" strokeDasharray="34 12" />
      <path
        d="M11 17.5C12.8 14.2 16.5 12.2 21 12.2C20.6 16.7 18.2 20.2 14.5 21C12.8 21.3 11.4 20.2 11 17.5Z"
        fill="#E0F2FE"
      />
    </svg>
  );
}

export function Sidebar({
  activeNav,
  onSelectNav,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const handlePick = (id: SidebarNavId) => {
    onSelectNav(id);
    onCloseMobile();
  };

  const navContent = (isMobile: boolean) => {
    const isMini = !isMobile && collapsed;
    return (
      <div className="flex flex-col h-full bg-white border-r border-slate-200/90">
        {/* Brand Block */}
        <div
          className={`h-16 px-4 flex items-center border-b border-slate-200/80 ${
            isMini ? 'justify-center' : 'justify-between gap-2'
          }`}
        >
          <button
            type="button"
            onClick={() => handlePick('overview')}
            className="flex items-center gap-3 text-left min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-lg"
          >
            <BrandMark />
            {!isMini && (
              <div className="min-w-0">
                <div className="font-display text-sm font-bold tracking-tight text-slate-900 truncate">
                  AirAware AI
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Urban Air Quality Assistant
                </div>
              </div>
            )}
          </button>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation sidebar"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            !isMini && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        {/* Navigation Links */}
        <nav aria-label="Dashboard Navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item.id)}
                title={isMini ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                  isMini ? 'justify-center px-0' : ''
                } ${
                  active
                    ? 'bg-sky-50 text-teal-800 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.22)]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 ${
                    active ? 'text-teal-700' : 'text-slate-400'
                  }`}
                />
                {!isMini && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Collapse / Tagline Footer */}
        <div className="p-3 border-t border-slate-200/80">
          {isMini ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="w-full py-2 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-3 py-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <div className="text-xs font-semibold text-teal-900">Breathe Smarter.</div>
              <div className="text-[11px] text-slate-600">Live Healthier.</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out sticky top-0 h-screen z-30 ${
          collapsed ? 'w-[76px]' : 'w-[256px]'
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {navContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
