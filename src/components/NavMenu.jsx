import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";

const navItems = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function MenuIcon({ open }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
    </svg>
  );
}

export default function NavMenu() {
  return (
    <Disclosure as="header" className="border-b border-slate-200 bg-white">
      {({ open }) => (
        <>
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
            <a href="#home" className="text-lg font-bold tracking-tight text-slate-900">
              Medi<span className="text-teal-700">kiosk</span>
            </a>

            <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 hover:text-teal-700">
                  {item.label}
                </a>
              ))}
              <a href="#start" className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Start intake
              </a>
            </nav>

            <DisclosureButton className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden" aria-label="Toggle navigation">
              <MenuIcon open={open} />
            </DisclosureButton>
          </div>

          <DisclosurePanel className="border-t border-slate-200 px-6 py-4 md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col gap-4" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm font-medium text-slate-700">
                  {item.label}
                </a>
              ))}
              <a href="#start" className="w-fit rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
                Start intake
              </a>
            </nav>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
