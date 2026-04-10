import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { X } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex tf-paper text-[var(--ink)]">
      <Sidebar />

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-[var(--ink)]/40" onClick={() => setMobileOpen(false)}></div>
          <div className="relative w-72 max-w-[80vw] h-full bg-[var(--paper-soft)] border-r-2 border-[var(--ink)] tf-fade-up">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-[var(--ink)] bg-white text-[var(--ink)] shadow-[2px_2px_0_0_var(--ink)]"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="-mt-10"><Sidebar /></div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          <div className="tf-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}
