/**
 * Som de "moeda" gerado via Web Audio API (sem arquivo externo).
 * Duas notas rápidas em arpejo, no estilo de moeda de videogame.
 */
export async function playCoinSound() {
  if (typeof window === "undefined") return;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  try {
    const ctx = new Ctx();
    if (ctx.state === "suspended") await ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
    gain.gain.setValueAtTime(0.22, now + 0.09);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(988, now); // B5
    osc.frequency.setValueAtTime(1319, now + 0.09); // E6
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.6);

    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    /* áudio bloqueado pelo navegador — ignora */
  }
}
