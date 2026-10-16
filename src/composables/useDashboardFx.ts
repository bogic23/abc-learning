import { ref, onMounted } from 'vue';

/** Animated count-up for stat numbers. */
export function useCountUp(target: number, duration = 900) {
  const value = ref(0);
  onMounted(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      value.value = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  return value;
}

/** Fake loading delay for skeleton shimmer demo. */
export function useFakeLoading(ms = 850) {
  const isLoading = ref(true);
  onMounted(() => setTimeout(() => (isLoading.value = false), ms));
  return isLoading;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 15) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Burning the midnight oil';
}
