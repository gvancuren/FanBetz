'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RefreshOnUnlock() {
  const searchParams = useSearchParams();
  const unlockedPostId = searchParams.get('unlockedPost');
  const router = useRouter();

  useEffect(() => {
    if (unlockedPostId) {
      router.refresh();
    }
  }, [unlockedPostId]);

  return null;
}
