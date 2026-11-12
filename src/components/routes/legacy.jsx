import React, { useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

/*
 * React Router 7 dropped `history` and `match`. These adapters give the
 * existing pages the same small surface they used under v5:
 *   history.push(path | { pathname, search, state }), history.replace,
 *   history.goBack, history.location, and match.params.
 */
export function useLegacyHistory() {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(() => {
    const go = (to, state, replace = false) => {
      if (to && typeof to === "object") {
        const path = `${to.pathname || location.pathname}${to.search || ""}${to.hash || ""}`;
        navigate(path, { state: to.state ?? state, replace });
      } else {
        navigate(to, { state, replace });
      }
    };
    return {
      push: (to, state) => go(to, state),
      replace: (to, state) => go(to, state, true),
      goBack: () => navigate(-1),
      location,
    };
  }, [navigate, location]);
}

export function useLegacyMatch() {
  const params = useParams();
  return useMemo(() => ({ params }), [params]);
}

// Renders a page with the v5-style `history`, `match` and `location` props.
export function LegacyPage({ component: Component }) {
  const history = useLegacyHistory();
  const match = useLegacyMatch();
  return <Component history={history} match={match} location={history.location} />;
}
