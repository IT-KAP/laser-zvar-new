'use client'

import { usePathname } from "next/navigation"
import { useEffect } from "react";

export default function ScrollToHash() {
    const pathname = usePathname();

    useEffect(() => {
        if(window.location.hash) {
            const id = decodeURIComponent(window.location.hash.substring(1))
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [pathname]);

    return null;
} 