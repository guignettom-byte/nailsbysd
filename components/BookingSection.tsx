"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

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

type Step = "service" | "date" | "time" | "form" | "success";

export default function BookingSection({ services }: BookingSectionProps) {
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = startOfDay(new Date());
  const maxDate = addDays(today, 90);

  async function fetchSlots(date: Date, serviceId: string) {
    setLoadingSlots(true);
    setSlots([]);
    try {
      const res = await fetch(
        `/api/slots?date=${format(date, "yyyy-MM-dd")}&serviceId=${serviceId}`
      );
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
    setStep("form");
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Requis";
    if (!form.lastName.trim()) errs.lastName = "Requis";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Email invalide";
    if (!form.phone.trim()) errs.phone = "Requis";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || !selectedDate || !selectedService || !selectedTime) return;

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceId: selectedService.id,
          date: appointmentDate.toISOString(),
        }),
      });

      if (res.ok) {
        setStep("success");
      } else {
        const data = await res.json();
        alert(data.error || "Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch {
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  }

  const availableSlots = slots.filter((s) => s.available);

  return (
    <section id="reservation" className="py-24 px-6 bg-[#faf6f1]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
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
            firstName={form.firstName}
            onReset={() => {
              setStep("service");
              setSelectedService(null);
              setSelectedDate(undefined);
              setSelectedTime("");
              setForm({ firstName: "", lastName: "", email: "", phone: "", comment: "" });
            }}
          />
        ) : (
          <div className="bg-white p-8 md:p-12">
            {/* Progress steps */}
            <StepIndicator current={step} />

            {/* Step 1: Service */}
            {step === "service" && (
              <div>
                <h3 className="font-display text-2xl text-[#2a2018] mb-8 text-center">
                  Choisissez votre prestation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleServiceSelect(s)}
                      className="text-left p-6 border border-[#e8d5c4] hover:border-[#b8975a] hover:bg-[#faf6f1] transition-all duration-200 group"
                    >
                      <p className="font-display text-xl text-[#2a2018] mb-1">{s.name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#2a2018]/50 tracking-wide">{formatDuration(s.duration)}</span>
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
                <button onClick={() => setStep("service")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">
                  ← Retour
                </button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">
                  Choisissez une date
                </h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-8 font-body">
                  Prestation : <strong>{selectedService?.name}</strong>
                </p>
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={fr}
                    disabled={[
                      { before: addDays(today, 1) },
                      { after: maxDate },
                      { dayOfWeek: [0] }, // Dimanche
                    ]}
                    startMonth={today}
                    endMonth={maxDate}
                    className="!font-body"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Time */}
            {step === "time" && (
              <div>
                <button onClick={() => setStep("date")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">
                  ← Retour
                </button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">
                  Choisissez un créneau
                </h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-8 font-body">
                  {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
                </p>
                {loadingSlots ? (
                  <div className="text-center py-8 text-[#b8975a]">Chargement des créneaux…</div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#2a2018]/60 mb-4">Aucun créneau disponible ce jour.</p>
                    <button onClick={() => setStep("date")} className="text-xs text-[#b8975a] uppercase tracking-widest underline">
                      Choisir une autre date
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`py-3 text-sm font-body border transition-all duration-200 ${
                          slot.available
                            ? "border-[#e8d5c4] text-[#2a2018] hover:border-[#b8975a] hover:bg-[#faf6f1] cursor-pointer"
                            : "border-[#f0e6d8] text-[#2a2018]/20 cursor-not-allowed bg-[#faf6f1]/50 line-through"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Form */}
            {step === "form" && (
              <div>
                <button onClick={() => setStep("time")} className="text-xs text-[#b8975a] mb-6 flex items-center gap-2 uppercase tracking-widest">
                  ← Retour
                </button>
                <h3 className="font-display text-2xl text-[#2a2018] mb-2 text-center">
                  Vos coordonnées
                </h3>
                <p className="text-center text-sm text-[#2a2018]/50 mb-8 font-body">
                  {selectedService?.name} · {selectedDate && format(selectedDate, "d MMM", { locale: fr })} à {selectedTime}
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="firstName"
                      label="Prénom *"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      error={errors.firstName}
                      placeholder="Sophie"
                    />
                    <Input
                      id="lastName"
                      label="Nom *"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      error={errors.lastName}
                      placeholder="Martin"
                    />
                  </div>
                  <Input
                    id="email"
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={errors.email}
                    placeholder="sophie@exemple.com"
                  />
                  <Input
                    id="phone"
                    label="Téléphone *"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    error={errors.phone}
                    placeholder="+41 79 000 00 00"
                  />
                  <Textarea
                    id="comment"
                    label="Commentaire (optionnel)"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    placeholder="Souhait particulier, allergie, forme d'ongles…"
                  />
                  <Button type="submit" size="lg" disabled={submitting} className="w-full">
                    {submitting ? "Envoi en cours…" : "Confirmer la réservation"}
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

function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "service", label: "Prestation" },
    { key: "date", label: "Date" },
    { key: "time", label: "Heure" },
    { key: "form", label: "Coordonnées" },
  ];

  const activeIndex = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center justify-center mb-10 gap-0">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-body transition-colors ${
                i <= activeIndex
                  ? "bg-[#b8975a] text-white"
                  : "bg-[#e8d5c4] text-[#2a2018]/40"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs mt-1 tracking-wider hidden sm:block ${i <= activeIndex ? "text-[#b8975a]" : "text-[#2a2018]/30"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-px mx-1 mb-4 ${i < activeIndex ? "bg-[#b8975a]" : "bg-[#e8d5c4]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function SuccessView({
  service,
  date,
  time,
  firstName,
  onReset,
}: {
  service: Service;
  date: Date;
  time: string;
  firstName: string;
  onReset: () => void;
}) {
  return (
    <div className="bg-white p-12 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle size={48} className="text-[#b8975a]" strokeWidth={1} />
      </div>
      <h3 className="font-display text-3xl text-[#2a2018] mb-3">Rendez-vous confirmé !</h3>
      <p className="text-[#2a2018]/60 font-body mb-8">
        Merci {firstName}, un email de confirmation vous a été envoyé.
      </p>
      <div className="bg-[#faf6f1] p-6 mb-8 text-left space-y-3">
        <div className="flex justify-between text-sm font-body">
          <span className="text-[#2a2018]/50">Prestation</span>
          <span className="font-medium">{service.name}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-[#2a2018]/50">Date</span>
          <span className="font-medium">{format(date, "EEEE d MMMM yyyy", { locale: fr })}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-[#2a2018]/50">Heure</span>
          <span className="font-medium">{time}</span>
        </div>
        <div className="flex justify-between text-sm font-body">
          <span className="text-[#2a2018]/50">Lieu</span>
          <span className="font-medium">Cheseaux-sur-Lausanne</span>
        </div>
      </div>
      <button
        onClick={onReset}
        className="text-xs tracking-widest uppercase text-[#b8975a] underline font-body"
      >
        Faire une nouvelle réservation
      </button>
    </div>
  );
}
