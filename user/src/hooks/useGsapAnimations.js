import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const useStaggerCards = (dependencies = []) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const cards = containerRef.current.querySelectorAll('.quiz-card-item');
    if (cards.length > 0) {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 35,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.45,
          stagger: 0.08,
          ease: 'back.out(1.4)',
          clearProps: 'transform,opacity',
        }
      );
    }
  }, dependencies);

  return containerRef;
};

export const useFloatingBadge = (speed = 2.5, rotation = 4) => {
  const badgeRef = useRef(null);

  useEffect(() => {
    if (!badgeRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(badgeRef.current, {
        y: -8,
        rotation: rotation,
        duration: speed,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, badgeRef);

    return () => ctx.revert();
  }, [speed, rotation]);

  return badgeRef;
};
