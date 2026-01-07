interface PhaseIntroProps {
    title?: string;
    stepLabel?: string;
}

export function PhaseIntro({ title, stepLabel }: PhaseIntroProps) {
    return (
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-amber-50/40 px-6 py-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.12)]">
            <div className="pointer-events-none absolute -left-10 top-6 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="pointer-events-none absolute -right-12 bottom-6 h-28 w-28 rounded-full bg-amber-200/40 blur-2xl" />
            <div className="mx-auto flex min-h-[260px] max-w-xl flex-col items-center justify-center gap-6">
                {stepLabel && (
                    <span className="rounded-full border border-emerald-200 bg-white/70 px-6 py-2 text-sm font-semibold tracking-[0.35em] text-emerald-700 shadow-sm sm:px-7 sm:py-2.5 sm:text-base">
                        {stepLabel}
                    </span>
                )}
                <p className="text-2xl font-semibold leading-relaxed text-slate-800 sm:text-3xl lg:text-4xl">
                    {title}
                </p>
                <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-emerald-300 to-amber-300" />
            </div>
        </div>
    );
}
