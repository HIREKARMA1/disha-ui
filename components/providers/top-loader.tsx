"use client";

import NextTopLoader from "nextjs-toploader";

export function TopLoader() {
  return (
    <NextTopLoader
      color="#1b52a4"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #1b52a4,0 0 5px #1b52a4"
      zIndex={9999}
      showAtBottom={false}
    />
  );
}
