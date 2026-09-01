"use client";

import { useTransition, useState } from "react";
import { moderateProviderAction, resolveComplaintAction } from "@/lib/actions/admin";

export function ModerateButtons({ providerId }: { providerId: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  if (done) return <span className="text-xs text-ink-tertiary">{done}</span>;
  return (
    <span className="flex gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(async () => {
          await moderateProviderAction(providerId, "APPROVED");
          setDone("approved");
        })}
        className="rounded-pill bg-state-success px-2.5 py-1 text-xs font-medium text-white"
      >
        Approve
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          await moderateProviderAction(providerId, "REJECTED");
          setDone("rejected");
        })}
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs"
      >
        Reject
      </button>
    </span>
  );
}

export function ResolveComplaintButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  if (done) return <span className="text-xs text-ink-tertiary">{done}</span>;
  return (
    <span className="flex gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(async () => {
          await resolveComplaintAction(id, "APPROVED");
          setDone("upheld");
        })}
        className="rounded-pill bg-brand-purple-600 px-2.5 py-1 text-xs font-medium text-white"
      >
        Uphold
      </button>
      <button
        disabled={pending}
        onClick={() => start(async () => {
          await resolveComplaintAction(id, "REJECTED");
          setDone("dismissed");
        })}
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs"
      >
        Dismiss
      </button>
    </span>
  );
}
