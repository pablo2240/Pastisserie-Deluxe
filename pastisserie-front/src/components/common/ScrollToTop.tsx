import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
        // También resetear contenedores con scroll interno si existen
        const scrollContainers = document.querySelectorAll('.custom-scrollbar, main, .overflow-y-auto');
        scrollContainers.forEach(container => {
            container.scrollTop = 0;
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
