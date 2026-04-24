// Reference-counted scroll lock — safe for concurrent modals/drawers.
// Uses position:fixed so iOS Safari (which ignores overflow:hidden on body) also locks correctly.
let lockCount = 0;
let savedY = 0;

export function lockScroll() {
  if (typeof window === "undefined") return;
  if (lockCount === 0) {
    savedY = window.scrollY;
    const body = document.body;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedY}px`;
    body.style.width = "100%";
  }
  lockCount++;
}

export function unlockScroll() {
  if (typeof window === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const body = document.body;
    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.width = "";
    window.scrollTo({ top: savedY, behavior: "instant" });
  }
}
