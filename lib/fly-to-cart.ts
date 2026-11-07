export function flyImageToCart(
  imageUrl: string,
  sourceEl: HTMLElement | null
) {
  if (typeof window === "undefined" || !sourceEl) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReduced) return;

  const cartBtn = document.querySelector<HTMLElement>("[data-cart-trigger]");
  if (!cartBtn) return;

  const from = sourceEl.getBoundingClientRect();
  const to = cartBtn.getBoundingClientRect();

  const flyer = document.createElement("img");
  flyer.src = imageUrl;
  flyer.alt = "";
  flyer.className = "cart-flyer";
  flyer.style.left = `${from.left + from.width / 2 - 36}px`;
  flyer.style.top = `${from.top + from.height / 2 - 36}px`;
  document.body.appendChild(flyer);

  // Force layout before animating
  flyer.getBoundingClientRect();

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  flyer.style.transform = `translate3d(${dx}px, ${dy}px, 80px) scale(0.2) rotateY(28deg)`;
  flyer.style.opacity = "0.15";

  window.setTimeout(() => {
    flyer.remove();
  }, 720);
}
