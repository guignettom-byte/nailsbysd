"use client";

import { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, addDays, startOfDay, parseISO } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/utils";
import { CheckCircle, User, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import "react-day-picker/dist/style.css";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BookingSectionProps {
  services: Service[];
}

type Step = "service" | "date" | "time" | "confirm" | "success";

export default function BookingSection({ services }: BookingSectionProps) {
  const { data: session, status: authStatus } = useSession();
  const isLoggedIn = authStatus === "authenticated";

  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  const fetchUnavailableDates = useCallback(async (month: Date, serviceId: string) => {
    setLoadingAvailability(true);
    try {
      const monthStr = format(month, "yyyy-MM");
      const res = await fetch(`/api/availability?month=${monthStr}&serviceId=${serviceId}`);
      const data = await res.json();
      setUnavailableDates((data.unavailableDates || []).map((d: string) => parseISO(d)));
    } catch {
      setUnavailableDates([]);
    } finally {
      setLoadingAvailability(false);
    }
  }, []);

  // Fetch unavailable dates when service is selected or month changes
  useEffect(() => {
    if (selectedService && step === "date") {
      fetchUnavailableDates(currentMonth, selectedService.id);
    }
  }, [selectedService, currentMonth, step, fetchUnavailableDates]);

  async function fetchSlots(date: Date, serviceId: string) {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/slots?date=${format(date, "yyyy-MM-dd")}&serviceId=${serviceId}`);
      const data = await res.json();
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleServiceSelect(service: Service) {
    setSelectedService(service);
    setSelectedDate(undefined);
    setSelectedTime("");
    setSlots([]);
    setUnavailableDates([]);
    setCurrentMonth(new Date());
    setStep("date");
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date || !selectedService) return;
    setSelectedDate(date);
    setSelectedTime("");
    fetchSlots(date, selectedService.id);
    setStep("time");
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    // If not logged in, redirect to login with info stored
    if (!isLoggedIn) {
      // Store booking intent in sessionStorage
      sessionStorage.setItem("bookingIntent", JSON.stringify({
        serviceId: selectedService?.id,
        date: selectedDate?.toISOString(),
        time,
      }));
      window.location.href = `/connexion?callbackUrl=${encodeURIComponent("/#reservation")}`;
      return;
    }
    setStep("confirm");
  }

  // Resume booking after login
  useEffect(() => {
    if (isLoggedIn && step === "service") {
      const intent = sessionStorage.getItem("bookingIntent");
      if (intent) {
        try {
          const { serviceId, date, time } = JSON.parse(intent);
          const svc = services.find((s) => s.id === serviceId);
          if (svc && date && time) {
            setSelectedService(svc);
            setSelectedDate(new Date(date));
            setSelectedTime(time);
            setStep("confirm");
            sessionStorage.removeItem("bookingIntent");
          }
        } catch { /* ignore */ }
      }
    }
  }, [isLoggedIn]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedService || !selectedTime) return;

    setSubmitting(true);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId: selectedService.id, date: appointmentDate.toISOString(), comment }),
    });

    setSubmitting(false);

    if (res.ok) {
      setStep("success");
    } else {
      const data = await res.json();
      if (data.redirect) window.location.href = data.redirect;
      else alert(data.error || "Une erreur s'est produite.");
    }
  }

  return (
    <section id="reservation" className="py-24 px-6 bg-[#faf6f1]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.4em] uppercase text-[#b8975a] mb-4 font-body">En ligne, 24h/24</p>
          <h2 className="font-display text-5xl md:text-6xl text-[#2a2018] mb-6">Réserver</h2>
          <div className="h-px w-16 bg-[#b8975a] mx-auto" />
        </div>

        {step === "success" ? (
          <SuccessView
            service={selectedService!}
            date={selectedDate!}
            time={selectedTime}
            clientName={(session?.user?.name || "").split(" ")[0]}
            onReset={() => { setStep("service"); setSelectedService(null); setSelectedDate(undefined); setSelectedTime(""); setComment(""); }}
          />
        ) : (
          <div className="bg-white p-8 md:p-12">
            {/* Auth banner */}
            {!isLoggedIn && authStatus !== "loading" && (
              <div className="mb-8 flex items-center justify-between gap-4 bg-[#faf6f1] px-5 py-4 border border-[#e8d5c4]">
                <p className="text-sm text-[#2a2018]/70">
                  <span className="font-medium">Un compte est requis</span> pour réserver.
                </p>
                <div className="flex gap-3 shrink-0">
                  <Link href="/connexion?callbackUrl=%2F%23reservation"
                    className="text-xs uppercase tracking-widest text-[#b8975a] flex items-center gap-1 hover:text-[#2a2018] transition-colors">
                    <LogIn size={14} /> Se connecter
                  </Link>
                  <Link href="/inscription"
                    className="text-xs uppercase tracking-widest bg-[#b8975a] text-white px-4 py-2 hover:bg-[#2a2018] transition-colors flex items-center gap-1">
                    <User size={14} /> Créer un compte
                  </Link>
                </div>
              </div>
            )}

            {/* Logged in badge */}
            {isLoggedIn && (
              <div className="mb-8 flex items-center gap-2 text-xs text-[#b8975a]">
                <User size={14} />
                <span>Connecté(e) en tant que <strong>{session?.user?.name}</strong></span>
                <Link href="/mon-compte" className="ml-auto underline hover:text-[#2a2018] transition-colors">Mon compte →</Link>
              </div>
            )}

            <StepIndicator current={step} />

            {/* Step 1: Service */}
            {step === "service" && (
              <div>
                <h3 className="font-display text-2xl text-[#2a2018] mb-8 text-center">Choisissez votre prestation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <button key={s.id} onClick={() => handleServiceSelect(s)}
                      className="text-left p-6 border border-[#e8d5c4] hover:border-[#b8975a] hover:bg-[#faf6f1] transition-all group">
                      <p className="font-display text-xl text-[#2a2018] mb-1">{s.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#2a2018]/50">{formatDuration(s.duration)}</span>
                        <span className="text-[#b8975a] font-display text-lg">{formatPrice(s.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date */}
            {step === "date" && (
              <div>
                <button onClick={() => setStep("service")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">← Retour</button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">Choisissez une date</h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-6">{selectedService?.name}</p>

                {/* Légende */}
                <div className="flex items-center justify-center gap-6 mb-6 text-xs text-[#2a2018]/50 font-body">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#b8975a] inline-block" /> Disponible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-200 inline-block" /> Complet
                  </span>
                </div>

                {loadingAvailability && (
                  <p className="text-center text-xs text-[#b8975a] mb-4">Vérification des disponibilités…</p>
                )}

                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    onMonthChange={(month) => setCurrentMonth(month)}
                    locale={fr}
                    disabled={[
                      { before: addDays(today, 1) },
                      { after: maxDate },
                      { dayOfWeek: [0] },
                      ...unavailableDates,
                    ]}
                    modifiers={{
                      unavailable: unavailableDates,
                    }}
                    modifiersStyles={{
                      unavailable: {
                        textDecoration: "line-through",
                        color: "#e57373",
                        opacity: 0.6,
                        backgroundColor: "#fef2f2",
                      },
                    }}
                    startMonth={today}
                    endMonth={maxDate}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Time */}
            {step === "time" && (
              <div>
                <button onClick={() => setStep("date")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">← Retour</button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">Choisissez un créneau</h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-8">
                  {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                {loadingSlots ? (
                  <div className="text-center py-8 text-[#b8975a]">Chargement…</div>
                ) : slots.filter((s) => s.available).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#2a2018]/60 mb-4">Aucun créneau disponible ce jour.</p>
                    <button onClick={() => setStep("date")} className="text-xs text-[#b8975a] uppercase tracking-widest underline">Choisir une autre date</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => (
                      <button key={slot.time} disabled={!slot.available} onClick={() => handleTimeSelect(slot.time)}
                        className={`py-3 text-sm border transition-all ${slot.available
                          ? "border-[#e8d5c4] text-[#2a2018] hover:border-[#b8975a] hover:bg-[#faf6f1]"
                          : "border-[#f0e6d8] text-[#2a2018]/20 cursor-not-allowed line-through"}`}>
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {!isLoggedIn && slots.some((s) => s.available) && (
                  <p className="text-center text-xs text-[#b8975a] mt-6">
                    Vous serez invité(e) à vous connecter pour finaliser la réservation.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === "confirm" && (
              <div>
                <button onClick={() => setStep("time")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">← Retour</button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">Confirmation</h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-8">
                  {selectedService?.name} · {selectedDate && format(selectedDate, "d MMM", { locale: fr })} à {selectedTime}
                </p>
                <div className="bg-[#faf6f1] p-6 mb-6 space-y-3">
                  <SummaryRow label="Prestation" value={selectedService?.name || ""} />
                  <SummaryRow label="Date" value={selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr }) : ""} />
                  <SummaryRow label="Heure" value={selectedTime} />
                  <SummaryRow label="Durée" value={formatDuration(selectedService?.duration || 0)} />
                  <SummaryRow label="Prix" value={formatPrice(selectedService?.price || 0)} gold />
                  <SummaryRow label="Client" value={session?.user?.name || ""} />
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <Textarea id="comment" label="Commentaire (optionnel)"
                    value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="Souhait particulier, forme d'ongles, allergie…" />
                  <Button type="submit" size="lg" disabled={submitting} className="w-full">
                    {submitting ? "Réservation en cours…" : "Confirmer la réservation"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryRow({ label, value, gold = false }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#2a2018]/50">{label}</span>
      <span className={`font-medium ${gold ? "text-[#b8975a] font-display text-lg" : "text-[#2a2018]"}`}>{value}</span>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Prestation" },
    { key: "date", label: "Date" },
    { key: "time", label: "Heure" },
    { key: "confirm", label: "Confirmation" },
  ];
  const activeIndex = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center justify-center mb-10 gap-0">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${i <= activeIndex ? "bg-[#b8975a] text-white" : "bg-[#e8d5c4] text-[#2a2018]/40"}`}>
              {i + 1}
            </div>
            <span className={`text-xs mt-1 tracking-wider hidden sm:block ${i <= activeIndex ? "text-[#b8975a]" : "text-[#2a2018]/30"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-16 h-px mx-1 mb-4 ${i < activeIndex ? "bg-[#b8975a]" : "bg-[#e8d5c4]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SuccessView({ service, date, time, clientName, onReset }: {
  service: Service; date: Date; time: string; clientName: string; onReset: () => void;
}) {
  return (
    <div className="bg-white p-12 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={48} className="text-[#b8975a]" strokeWidth={1} />
      </div>
      <h3 className="font-display text-3xl text-[#2a2018] mb-3">Rendez-vous confirmé !</h3>
      <p className="text-[#2a2018]/60 font-body mb-8">
        Merci {clientName}, un email de confirmation vous a été envoyé.
      </p>
      <div className="bg-[#faf6f1] p-6 mb-8 text-left space-y-3">
        <SummaryRow label="Prestation" value={service.name} />
        <SummaryRow label="Date" value={format(date, "EEEE d MMMM yyyy", { locale: fr })} />
        <SummaryRow label="Heure" value={time} />
        <SummaryRow label="Prix" value={formatPrice(service.price)} gold />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/mon-compte"
          className="inline-flex items-center justify-center px-8 py-3 border border-[#b8975a] text-[#b8975a] text-xs uppercase tracking-widest hover:bg-[#b8975a] hover:text-white transition-colors">
          Voir mon historique
        </Link>
        <button onClick={onReset}
          className="text-xs tracking-widest uppercase text-[#2a2018]/40 hover:text-[#b8975a] transition-colors">
          Faire une autre réservation
        </button>
      </div>
    </div>
  );
}
