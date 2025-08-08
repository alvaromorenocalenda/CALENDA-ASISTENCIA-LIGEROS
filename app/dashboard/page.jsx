"use client";

import { useForm } from "react-hook-form";
import { ClipboardList, Clock, Car, Camera, Route } from "lucide-react";
import { db, storage, firebaseConfig } from "../../lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function ParteGruista() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm();

  const tipos = [
    "URBANO MEDIODIA",
    "URBANO FESTIVO",
    "SALIDA MEDIODIA",
    "SALIDA FESTIVO",
  ];

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white/80 px-4 py-2.5 text-slate-800 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition";
  const fieldLabel = "text-sm font-medium text-slate-700";

  // -------------- onSubmit con fallback REST ------------------
  async function onSubmit(values) {
    try {
      console.log("[onSubmit] start");
      let fotoURL = null;

      // 1) SUBIR FOTO (opcional). Si falla, seguimos sin foto.
      if (values.foto && values.foto.length > 0) {
        try {
          const file = values.foto[0];
          const storageRef = ref(storage, `partes/${Date.now()}_${file.name}`);
          const task = uploadBytesResumable(storageRef, file, {
            contentType: file.type,
          });

          await new Promise((resolve, reject) => {
            const to = setTimeout(
              () => reject(new Error("Timeout en upload (30s)")),
              30000
            );
            task.on(
              "state_changed",
              (snap) => {
                const pct = Math.round(
                  (snap.bytesTransferred / snap.totalBytes) * 100
                );
                console.log(`[upload] ${pct}%`);
              },
              (err) => {
                clearTimeout(to);
                reject(err);
              },
              () => {
                clearTimeout(to);
                resolve();
              }
            );
          });

          fotoURL = await getDownloadURL(storageRef);
          console.log("[upload] URL:", fotoURL);
        } catch (e) {
          console.warn(
            "[onSubmit] fallo subiendo foto, continuo sin foto:",
            e?.message || e
          );
        }
      }

      // 2) PAYLOAD
      const kmsNumber =
        values.kms === undefined || values.kms === ""
          ? null
          : Number(values.kms);

      const payload = {
        expediente: values.expediente || "",
        matricula: values.matricula || "",
        compania: values.compania || "",
        tipo: values.tipo || "",
        horaInicio: values.horaInicio || "",
        horaFin: values.horaFin || "",
        observaciones: values.observaciones || "",
        kms: isNaN(kmsNumber) ? null : kmsNumber,
        fotoURL: fotoURL || null,
        creadoEn: Timestamp.now(),
      };

      // 3) PRIMERO: SDK normal (addDoc)
      try {
        console.log("[onSubmit] Firestore addDoc…");
        await addDoc(collection(db, "partesGruista"), payload);
        console.log("[onSubmit] Firestore OK (SDK)");
        alert("Parte enviado correctamente ✅");
        reset();
        setValue("foto", undefined);
        return;
      } catch (sdkErr) {
        console.warn(
          "[onSubmit] SDK falló, uso REST:",
          sdkErr?.code,
          sdkErr?.message || sdkErr
        );
      }

      // 4) FALLBACK REST (evita WebChannel)
      const { apiKey, projectId } = firebaseConfig;
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/partesGruista?key=${apiKey}`;

      // Firestore REST necesita tipos
      const toFirestoreFields = (obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => {
            if (v === null || v === undefined) return [k, { nullValue: null }];
            if (v instanceof Timestamp)
              return [k, { timestampValue: v.toDate().toISOString() }];
            if (typeof v === "number")
              return [k, { integerValue: String(v) }];
            if (typeof v === "boolean") return [k, { booleanValue: v }];
            return [k, { stringValue: String(v) }];
          })
        );

      const body = { fields: toFirestoreFields(payload) };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`REST ${res.status} ${res.statusText}: ${text}`);
      }

      console.log("[onSubmit] Firestore OK (REST)");
      alert("Parte enviado correctamente ✅ (REST)");
      reset();
      setValue("foto", undefined);
    } catch (error) {
      console.error("Error definitivo:", error);
      alert(`Error al enviar el parte ❌\n${error?.message || error}`);
    }
  }
  // ------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-lg">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Parte de Gruista
            </h1>
            <p className="text-sm text-slate-500">
              Completa los datos del servicio y envía el parte.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm md:p-8"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={fieldLabel}>Expediente</label>
              <input
                {...register("expediente")}
                type="text"
                placeholder="Ej: 12345"
                className={inputClass}
              />
            </div>
            <div>
              <label className={fieldLabel}>Matrícula</label>
              <div className="relative">
                <Car
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                  size={18}
                />
                <input
                  {...register("matricula")}
                  type="text"
                  placeholder="Ej: 1234-ABC"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={fieldLabel}>Compañía</label>
              <input
                {...register("compania")}
                type="text"
                placeholder="Ej: Mapfre"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className={fieldLabel}>Tipo de servicio</label>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {tipos.map((tipo) => (
                <label
                  key={tipo}
                  className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 shadow-sm transition hover:border-red-200 hover:bg-red-50/60"
                >
                  <input
                    {...register("tipo")}
                    type="radio"
                    value={tipo}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 bg-white peer-checked:border-transparent peer-checked:bg-gradient-to-br peer-checked:from-red-500 peer-checked:to-rose-500">
                    <span className="hidden h-1.5 w-1.5 rounded-full bg-white peer-checked:block" />
                  </span>
                  <span className="text-sm font-medium text-slate-700 peer-checked:text-red-700">
                    {tipo}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={fieldLabel}>Hora inicio</label>
              <div className="relative">
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                  size={18}
                />
                <input
                  {...register("horaInicio")}
                  type="time"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel}>Hora fin</label>
              <div className="relative">
                <Clock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                  size={18}
                />
                <input
                  {...register("horaFin")}
                  type="time"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          {/* Foto (opcional). Si CORS falla, seguirá guardando gracias al fallback */}
          <div className="mt-6">
            <label className={fieldLabel}>Foto del parte</label>
            <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-4 py-4 text-slate-600 transition hover:border-red-300 hover:bg-red-50/40">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-sm">
                  <Camera size={18} className="opacity-70" />
                </div>
                <div>
                  <p className="text-sm font-medium">Subir imagen</p>
                  <p className="text-xs text-slate-500">PNG, JPG o PDF</p>
                </div>
              </div>
              <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-sm">
                Elegir archivo
              </div>
              <input
                {...register("foto")}
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="sr-only"
              />
            </label>

            {(() => {
              const fileList = watch("foto");
              const file = fileList && fileList.length ? fileList[0] : null;
              if (!file) return null;
              return (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Seleccionado:</span>{" "}
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  {file.type?.startsWith("image/") && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Vista previa"
                      className="mt-2 max-h-44 w-auto rounded-lg border border-slate-200 object-contain"
                      onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                    />
                  )}
                </div>
              );
            })()}
          </div>

          <div className="mt-6">
            <label className={fieldLabel}>Observaciones</label>
            <textarea
              {...register("observaciones")}
              rows={4}
              placeholder="Observaciones del gruista..."
              className={`${inputClass} min-h-[120px]`}
            />
          </div>

          <div className="mt-6">
            <label className={fieldLabel}>Kilómetros recorridos</label>
            <div className="relative">
              <Route
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                size={18}
              />
              <input
                {...register("kms")}
                type="number"
                placeholder="Ej: 120"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-rose-500 px-6 py-3 text-white shadow-lg transition hover:from-red-500 hover:to-rose-500 focus:outline-none focus:ring-4 focus:ring-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-sm font-semibold tracking-wide">
                {isSubmitting ? "Enviando..." : "Enviar parte"}
              </span>
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Los datos se envían de forma segura. Revisa antes de enviar.
        </p>
      </div>
    </div>
  );
}
