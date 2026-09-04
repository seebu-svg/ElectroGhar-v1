import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SPA navigation keeps the previous scroll position by default,
 * which can land a "new" page mid-scroll with its top hidden
 * under the sticky header. This resets it so every route change
 * starts at the top of the page.
 *
 * Keys on pathname only — query-string changes (in-page filters,
 * pagination) intentionally keep the current scroll position.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
