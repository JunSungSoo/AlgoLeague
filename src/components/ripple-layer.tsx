"use client";

import { useEffect } from "react";

export function RippleLayer() {
    useEffect(() => {
        function click(event: MouseEvent) {
            if (event.button !== 0 || event.detail === 0) return;
            const wave = document.createElement("span");
            wave.className = "algoleague-global-ripple";
            wave.style.left = `${event.clientX}px`;
            wave.style.top = `${event.clientY}px`;
            document.body.appendChild(wave);
            wave.addEventListener("animationend", () => wave.remove(), { once: true });
        }
        document.addEventListener("click", click);
        return () => document.removeEventListener("click", click);
    }, []);
    return null;
}
