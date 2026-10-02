import { CircleDollarSign, Database, ReceiptText } from "lucide-react";

export default function RevenuePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Financial reporting</p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Revenue</h1>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Revenue tracking is not configured for this MessIQ project.</p>
      </header>

      <section className="glass-card rounded-2xl p-6 sm:p-8" aria-labelledby="revenue-unavailable-heading">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ReceiptText className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 id="revenue-unavailable-heading" className="font-display text-xl font-semibold">Revenue analytics unavailable</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The current Firestore model contains meal selections, profiles, menus, and feedback, but no payment, billing, or transaction records. Revenue analytics require actual billing data.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border bg-card/70 px-3 py-2 text-xs text-muted-foreground">
            <Database className="h-4 w-4" aria-hidden="true" /> No financial figures are available to report
          </div>
        </div>
      </section>
    </div>
  );
}
