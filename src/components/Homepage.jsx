import * as Dialog from "@radix-ui/react-dialog";
import NavMenu from "./NavMenu.jsx";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavMenu />

      <main id="home" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Patient intake made simple
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Welcome to Medikiosk.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Register your visit, share your details, and get the care you need without unnecessary waiting.
          </p>

          <div id="start" className="mt-8 flex flex-wrap items-center gap-4">
            <Dialog.Root>
              <Dialog.Trigger className="rounded-md bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">
                Start patient intake
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-slate-950/40" />
                <Dialog.Content className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
                  <Dialog.Title className="text-lg font-semibold text-slate-900">
                    Patient intake
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">
                    Intake is ready to begin. Connect this action to your registration flow when you are ready.
                  </Dialog.Description>
                  <Dialog.Close className="mt-6 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Close
                  </Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <a href="#services" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              View services
            </a>
          </div>
        </div>

        <section id="services" className="mt-20 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-3">
          <div>
            <h2 className="font-semibold text-slate-900">Quick registration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Complete essential patient details before your visit.</p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Clear information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Keep your care information organized and accessible.</p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Connected care</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Make the first step of every visit easier for everyone.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
