import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Cycles through a list of short status messages while `active` is true,
// e.g. ["Verifying...", "Checking records...", "Almost there..."] - gives
// the patient a sense of progress instead of a static "..." during
// multi-second API calls (ABHA verify, summary generation, etc).
function useCyclingMessage(messages, active, intervalMs = 2400) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || !messages || messages.length === 0) return undefined;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);

  return messages && messages.length > 0 ? messages[index % messages.length] : "";
}

// Drop-in replacement for the old `{isBusy ? "..." : label}` button content.
// Renders a spinner + a rotating status message while busy, and the normal
// idle label otherwise.
export default function BusyLabel({ busy, messages, idleLabel, intervalMs }) {
  const message = useCyclingMessage(messages, busy, intervalMs);
  if (!busy) return <>{idleLabel}</>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      {message}
    </span>
  );
}
