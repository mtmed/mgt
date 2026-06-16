// Sofortiges, dezentes Lade-Feedback bei Navigation (statt „Einfrieren").
export default function Loading() {
  return (
    <div className="anim-in space-y-3" aria-hidden="true">
      <div className="h-7 w-32 animate-pulse rounded bg-black/5" />
      <div className="h-20 animate-pulse rounded-[12px] bg-black/5" />
      <div className="h-20 animate-pulse rounded-[12px] bg-black/5" />
      <div className="h-20 animate-pulse rounded-[12px] bg-black/5" />
    </div>
  );
}
