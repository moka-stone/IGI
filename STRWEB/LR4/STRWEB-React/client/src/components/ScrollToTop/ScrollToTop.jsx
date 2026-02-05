import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Скроллим только при смене маршрута, а не при первой загрузке
    if (prevPathname.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;

