"use client";

import { Session } from "@ory/client-fetch";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const useRedirect = (session: Session | null) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      const returnTo = searchParams.get("return_to");

      if (returnTo) {
        window.location.href = returnTo;
        return;
      }

      router.push(`/settings?${searchParams.toString()}`);
    } else {
      router.push(`/login?${searchParams.toString()}`);
    }
  }, [session, router, searchParams]);
};

interface Props {
  session: Session | null;
}
export default function HomeUI({ session }: Props) {
  useRedirect(session);

  return null;
}
