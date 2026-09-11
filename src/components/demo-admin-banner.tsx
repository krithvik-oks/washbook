"use client";

import { useRef, useState } from "react";

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD;

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  async function copy() {
    let succeeded = false;

    try {
      await navigator.clipboard.writeText(value);
      succeeded = true;
    } catch {
      // Clipboard API unavailable/denied — fall back to selecting the text
      // so the user can copy it manually with Ctrl/Cmd+C.
      if (codeRef.current) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        selection?.removeAllRanges();
        selection?.addRange(range);
        try {
          succeeded = document.execCommand("copy");
        } catch {
          succeeded = false;
        }
      }
    }

    if (succeeded) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--muted)] w-16 shrink-0">{label}</span>
      <code ref={codeRef} className="flex-1 rounded-md bg-[var(--accent-soft)] px-2 py-1 text-sm">
        {value}
      </code>
      <button type="button" onClick={copy} className="btn btn-secondary btn-sm shrink-0">
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export function DemoAdminBanner() {
  if (!DEMO_EMAIL || !DEMO_PASSWORD) return null;

  return (
    <div className="card mx-auto max-w-md p-4">
      <p className="text-sm font-medium">Try the admin panel — demo login</p>
      <div className="mt-3 flex flex-col gap-2">
        <CopyField label="Email" value={DEMO_EMAIL} />
        <CopyField label="Password" value={DEMO_PASSWORD} />
      </div>
    </div>
  );
}
