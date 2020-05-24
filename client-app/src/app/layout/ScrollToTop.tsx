import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// wrap whole app to add scroll to top functionality for whole app
export default function ScrollToTop({children}: any) {
  const { pathname } = useLocation();

  // whenever the pathname in the application changes, the scroll to top function will run
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
}

// https://reacttraining.com/react-router/web/guides/scroll-restoration