


import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/auth.store";
import FormikInput from "../../components/FormikInput";
import { FaUser, FaEnvelope, FaShieldAlt, FaCog, FaCamera, FaSave } from "react-icons/fa";
import Swal from "sweetalert2";

/**
 * ProfilePage - Page de gestion du profil utilisateur
 * Affiche les informations utilisateur et permet de les éditer
 */
export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState("info"); // "info" | "security" | "settings"
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-lg">Chargement du profil...</p>
      </div>
    );
  }

  // Initiales de l'utilisateur
  const initials = user.fullname
    ? user.fullname
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  // Configuration des rôles avec couleurs
  const roleConfig = {
    SUPER_ADMIN: { label: "Super Admin", color: "text-purple-600", bgColor: "bg-purple-100", borderColor: "border-purple-500" },
    ADMIN: { label: "Admin", color: "text-blue-600", bgColor: "bg-blue-100", borderColor: "border-blue-500" },
    USER: { label: "Utilisateur", color: "text-green-600", bgColor: "bg-green-100", borderColor: "border-green-500" },
  };
  const role = roleConfig[user.role] || roleConfig.USER;

  // Schéma de validation Formik
  const validationSchema = Yup.object({
    fullname: Yup.string().min(3, "Minimum 3 caractères").required("Nom obligatoire"),
    email: Yup.string().email("Email invalide").required("Email obligatoire"),
  });

  // Handle submit du formulaire
  const handleSubmit = async (values) => {
    try {
      updateUser(values);
      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Profil mis à jour",
        text: "Vos informations ont été sauvegardées.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Erreur", "La mise à jour a échoué.", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:scale-105 transition-transform">
          <FaUser className="text-white text-3xl" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Mon Profil
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos informations personnelles et vos paramètres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Avatar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 text-center">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg border-4 ${role.borderColor}`}>
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors border-2 border-blue-500">
                <FaCamera className="text-blue-600 text-lg" />
              </button>
            </div>

            {/* Infos */}
            <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.fullname}</h2>
            <p className="text-gray-500 mt-1">{user.email}</p>

            {/* Role Badge */}
            <div className={`mt-4 inline-block px-4 py-2 rounded-full font-semibold ${role.bgColor} ${role.color}`}>
              {role.label}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID Utilisateur</p>
                <p className="font-semibold text-gray-800">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="font-semibold text-green-600">Actif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Tabs & Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center gap-2 justify-center ${
                  activeTab === "info"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaUser size={16} /> Informations
              </button>

              <button
                onClick={() => setActiveTab("security")}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center gap-2 justify-center ${
                  activeTab === "security"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaShieldAlt size={16} /> Sécurité
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center gap-2 justify-center ${
                  activeTab === "settings"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FaCog size={16} /> Paramètres
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* TAB: Informations */}
              {activeTab === "info" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Informations personnelles</h3>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Modifier
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <Formik
                      initialValues={{ fullname: user.fullname, email: user.email }}
                      validationSchema={validationSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form className="space-y-4">
                          <FormikInput name="fullname" label="Nom complet" placeholder="Votre nom" />
                          <FormikInput name="email" label="Email" type="email" placeholder="votre@email.com" />

                          <div className="flex gap-3 pt-4">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="flex-1 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                            >
                              <FaSave size={16} /> Enregistrer
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Nom complet</p>
                        <p className="text-lg font-semibold text-gray-800">{user.fullname}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <FaEnvelope className="text-blue-600" /> {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Sécurité */}
              {activeTab === "security" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Paramètres de sécurité</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
                      <FaShieldAlt className="text-blue-600 text-xl mt-1" />
                      <div>
                        <p className="font-semibold text-gray-800">Mot de passe</p>
                        <p className="text-sm text-gray-600 mt-1">Changez régulièrement votre mot de passe pour plus de sécurité</p>
                        <button className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                      <div>
                        <p className="font-semibold text-gray-800">Authentification à deux facteurs</p>
                        <p className="text-sm text-gray-600 mt-1">Protégez votre compte avec une couche de sécurité supplémentaire</p>
                        <button className="mt-3 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Activer 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Paramètres */}
              {activeTab === "settings" && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Préférences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">Notifications par email</p>
                        <p className="text-sm text-gray-600 mt-1">Recevez des mises à jour importantes</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-800">Mode sombre</p>
                        <p className="text-sm text-gray-600 mt-1">Activer le thème sombre</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}