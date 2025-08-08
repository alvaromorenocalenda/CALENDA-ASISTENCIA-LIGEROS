"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter(); // para redireccionar

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // redirige a /dashboard
    } catch (error) {
      setErrorMsg("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-5xl">
        <div className="flex flex-col items-center justify-center p-10 w-full">
          <Image
            src="/Logotipo Calenda Asistencia S.L..jpg"
            alt="Logo Calenda Asistencia"
            width={250}
            height={90}
            priority
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Iniciar sesión
          </h1>

          <form
            onSubmit={handleLogin}
            className="flex flex-col gap-4 w-full max-w-md"
          >
            <input
              type="email"
              placeholder="Correo electrónico"
              className="border border-gray-300 p-3 rounded-lg w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="border border-gray-300 p-3 rounded-lg w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg transition w-full"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
