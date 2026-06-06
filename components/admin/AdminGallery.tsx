"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Trash2, Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  url: string;
  title: string | null;
  category: string;
}

interface Service {
  id: string;
  name: string;
}

const EXTRA_CATEGORIES = ["Nail Art", "Pose", "Retouche", "Dépose", "Autre"];

export default function AdminGallery({
  initialPhotos,
  services,
}: {
  initialPhotos: Photo[];
  services: Service[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(services[0]?.name || "Autre");
  const [filterCat, setFilterCat] = useState("Tous");
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCategories = ["Tous", ...Array.from(new Set([
    ...services.map((s) => s.name),
    ...EXTRA_CATEGORIES,
  ]))];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("category", category);

    const res = await fetch("/api/photos", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setPhotos((prev) => [data.photo, ...prev]);
      setFile(null);
      setPreview(null);
      setTitle("");
      if (inputRef.current) inputRef.current.value = "";
    } else {
      alert(data.error || "Erreur upload");
    }
    setUploading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    setDeleting(id);
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  const filtered = filterCat === "Tous" ? photos : photos.filter((p) => p.category === filterCat);

  return (
    <div>
      {/* Upload zone */}
      <div className="bg-white border border-gray-100 p-6 mb-8">
        <h2 className="font-display text-xl text-[#2a2018] mb-4 flex items-center gap-2">
          <ImagePlus size={20} className="text-[#78716c]" /> Ajouter une photo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-gray-200 hover:border-[#78716c] transition-colors cursor-pointer flex flex-col items-center justify-center p-8 relative"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="relative w-full aspect-square">
                <Image src={preview} alt="preview" fill className="object-cover" />
              </div>
            ) : (
              <>
                <Upload size={32} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">Cliquer pour choisir une photo</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP — max 4.5 MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#78716c]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
                {EXTRA_CATEGORIES.filter((c) => !services.find((s) => s.name === c)).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-400 block mb-1">Titre (optionnel)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Dégradé rose printemps"
                className="w-full border-b border-gray-200 py-2 text-sm focus:outline-none focus:border-[#78716c]"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full mt-4"
            >
              {uploading ? "Upload en cours…" : "Publier la photo"}
            </Button>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
              filterCat === cat
                ? "bg-[#78716c] text-white"
                : "border border-gray-200 text-gray-500 hover:border-[#78716c]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-300 border border-dashed border-gray-200">
          Aucune photo dans cette catégorie
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden bg-gray-100">
              <Image
                src={photo.url}
                alt={photo.title || photo.category}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col items-end justify-between p-2">
                <button
                  onClick={() => handleDelete(photo.id)}
                  disabled={deleting === photo.id}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 hover:bg-red-700 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white text-xs px-2 py-0.5 self-start">
                  {photo.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">{photos.length} photo{photos.length > 1 ? "s" : ""} au total</p>
    </div>
  );
}
