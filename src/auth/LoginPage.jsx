import React, { useState } from "react";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useFormikContext } from "formik"; // Import important pour le bouton
import { useAuthStore } from "../store/auth.store";
import FormContainer from "../components/FormContainer";
import FormikInput from "../components/FormikInput";
import { toast } from "react-toastify";
import { loginAPI } from "../api/auth";
import { FaLock, FaSignInAlt, FaInfoCircle, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";

// Petit composant interne pour gérer l'état du bouton de soumission
const LoginSubmitButton = () => {
  const { isSubmitting } = useFormikContext(); // Récupère l'état directement de Formik

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2 group
        ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'shadow-blue-200 hover:shadow-blue-300 hover:scale-[1.02] active:scale-95'}
      `}
    >
      {isSubmitting ? (
        <>
          <FaSpinner className="animate-spin" />
          Connexion...
        </>
      ) : (
        <>
          <FaSignInAlt className="group-hover:translate-x-1 transition-transform" />
          Se connecter
        </>
      )}
    </button>
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("Email obligatoire"),
    password: Yup.string().required("Mot de passe obligatoire"),
  });

  const initialValues = { email: "", password: "" };

  const handleSubmit = async (values, { setErrors, setSubmitting }) => {
    try {
      const res = await loginAPI(values); 
      login({ user: res.user, token: res.token });
      toast.success("Heureux de vous revoir !");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ email: err.message || "Identifiants incorrects" });
      toast.error("Échec de la connexion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-50 via-gray-100 to-blue-100 flex justify-center items-center px-4">
      <div className="w-full max-w-md">
        
        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-white">
          
          <div className="flex flex-col items-center mb-10">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-200 mb-4">
              <FaLock className="text-white text-3xl" />
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent italic">
              Authentification
            </h1>
          </div>

          <FormContainer
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <FormikInput
              name="email"
              label="Adresse Email"
              type="email"
              placeholder="exemple@domaine.com"
            />

            {/* Container relatif pour l'oeil */}
            <div className="relative">
              <FormikInput
                name="password"
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-400 hover:text-blue-600 transition-colors"
                tabIndex="-1" // Évite que le bouton prenne le focus lors d'une tabulation
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <LoginSubmitButton />
          </FormContainer>

          <div className="mt-10 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-blue-700 font-bold mb-2 uppercase">
              <FaInfoCircle /> Accès Démo
            </div>
            <p>Admin: <b>test@artisan.com</b> / <b>test1234</b></p>
          </div>
        </div>
      </div>
    </div>
  );
}