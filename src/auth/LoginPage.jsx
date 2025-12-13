import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import FormContainer from "../components/FormContainer";
import FormikInput from "../components/FormikInput";
import { toast } from "react-toastify";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const validationSchema = Yup.object({
    email: Yup.string().email("Email invalide").required("Email obligatoire"),
    password: Yup.string().required("Mot de passe obligatoire"),
  });

  const initialValues = {
    email: "",
    password: "",
  };

  // Fake API (en attendant Nest.js)
  const fakeLoginRequest = async (values) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (values.email === "admin@test.com" && values.password === "admin123") {
          resolve({
            token: "FAKE_JWT_TOKEN",
            user: {
              id: 1,
              fullname: "Super Admin",
              email: "admin@test.com",
              role: "SUPER_ADMIN",
            },
          });
        } else if (values.email === "user@test.com" && values.password === "user123") {
          resolve({
            token: "FAKE_JWT_TOKEN",
            user: {
              id: 2,
              fullname: "Utilisateur",
              email: "user@test.com",
              role: "USER",
            },
          });
        } else {
          reject(new Error("Identifiants incorrects"));
        }
      }, 600);
    });
  };

  const handleSubmit = async (values, { setErrors, setSubmitting }) => {
    try {
      const res = await fakeLoginRequest(values);

      login({ user: res.user, token: res.token });
      
      toast.success("Connexion réussie !");

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ email: "Email ou mot de passe incorrect" });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">

        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>

        <FormContainer
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <FormikInput
            name="email"
            label="Email"
            type="email"
            placeholder="Entrez votre email"
          />

          <FormikInput
            name="password"
            label="Mot de passe"
            type="password"
            placeholder="Entrez votre mot de passe"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </FormContainer>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>Compte admin : <b>admin@test.com</b> / <b>admin123</b></p>
          <p>Compte utilisateur : <b>user@test.com</b> / <b>user123</b></p>
        </div>
      </div>
    </div>
  );
}
