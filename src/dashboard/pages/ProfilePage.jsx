import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "../../store/auth.store";
import FormikInput from "../../components/FormikInput";
import { FaUser, FaShieldAlt, FaCamera, FaSave, FaLock } from "react-icons/fa";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [activeTab, setActiveTab] = useState("info");
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPass, setIsEditingPass] = useState(false);

  if (!user) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  // Calcul des initiales basé sur Name et Firstname
  const initials = `${user.name?.[0] || ""}${user.firstname?.[0] || ""}`.toUpperCase() || "U";

  // Mise à jour des informations (Nom, Prénom, Email)
  const handleUpdateInfo = async (values) => {
    try {
      await updateUser(values);
      setIsEditingInfo(false);
      Swal.fire({ icon: "success", title: "Profil mis à jour", timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire("Erreur", "Impossible de mettre à jour le profil", "error");
    }
  };

  // Mise à jour du mot de passe
  const handleUpdatePassword = async (values, { resetForm }) => {
    try {
      // Appel de la nouvelle fonction du store
      await useAuthStore.getState().updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      
      setIsEditingPass(false);
      resetForm();
      Swal.fire({ icon: "success", title: "Mot de passe modifié" });
    } catch (error) {
      Swal.fire("Erreur", error.message, "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
      {/* Header */}
     <div className="flex items-center gap-3">
               <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg hover:scale-105 transition-transform ">
                 <FaUser className="text-white text-2xl" />
               </div>
               <div>
                 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Mon Profil</h1>
                 <p className="text-sm text-gray-500 mt-1">Gestion du profil</p>
               </div>
             </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Gauche : Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-sm">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow border border-gray-200 text-blue-600 hover:text-blue-700">
                <FaCamera size={14} />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-800">{user.name} {user.firstname}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {user.role || "Utilisateur"}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Tabs & Formulaires */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {["info", "security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsEditingInfo(false); setIsEditingPass(false); }}
                  className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab === "info" ? "Informations" : "Sécurité"}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* ONGLET : INFORMATIONS */}
              {activeTab === "info" && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Détails personnels</h3>
                    {!isEditingInfo && (
                      <button onClick={() => setIsEditingInfo(true)} className="text-sm text-blue-600 font-semibold hover:underline">
                        Modifier
                      </button>
                    )}
                  </div>

                  {isEditingInfo ? (
                    <Formik
                      initialValues={{ name: user.name, firstname: user.firstname, email: user.email }}
                      validationSchema={Yup.object({
                        name: Yup.string().required("Requis"),
                        firstname: Yup.string().required("Requis"),
                        email: Yup.string().email("Invalide").required("Requis"),
                      })}
                      onSubmit={handleUpdateInfo}
                    >
                      <Form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormikInput name="name" label="Nom" />
                          <FormikInput name="firstname" label="Prénom" />
                        </div>
                        <FormikInput name="email" label="Adresse Email" type="email" />
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <FaSave size={14} /> Enregistrer
                          </button>
                          <button type="button" onClick={() => setIsEditingInfo(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">
                            Annuler
                          </button>
                        </div>
                      </Form>
                    </Formik>
                  ) : (
                    <div className="grid gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Nom complet</p>
                        <p className="text-gray-800 font-medium">{user.name} {user.firstname}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email</p>
                        <p className="text-gray-800 font-medium">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ONGLET : SÉCURITÉ */}
              {activeTab === "security" && (
                <div className="animate-fadeIn">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Sécurité du compte</h3>
                    {!isEditingPass && (
                      <button onClick={() => setIsEditingPass(true)} className="text-sm text-blue-600 font-semibold hover:underline">
                        Changer le mot de passe
                      </button>
                    )}
                  </div>

                  {isEditingPass ? (
                    <Formik
                      initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
                      validationSchema={Yup.object({
                        oldPassword: Yup.string().required("Requis"),
                        newPassword: Yup.string().min(6, "6 caractères min.").required("Requis"),
                        confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], "Mots de passe différents").required("Requis"),
                      })}
                      onSubmit={handleUpdatePassword}
                    >
                      <Form className="space-y-4">
                        <FormikInput name="oldPassword" label="Ancien mot de passe" type="password" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormikInput name="newPassword" label="Nouveau mot de passe" type="password" />
                          <FormikInput name="confirmPassword" label="Confirmer" type="password" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                            <FaLock size={14} /> Mettre à jour
                          </button>
                          <button type="button" onClick={() => setIsEditingPass(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold">
                            Annuler
                          </button>
                        </div>
                      </Form>
                    </Formik>
                  ) : (
                    <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-4">
                      <div className="p-3 bg-white rounded-full shadow-sm">
                        <FaShieldAlt className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-semibold">Votre mot de passe est protégé</p>
                        <p className="text-sm text-gray-500">Dernière modification :</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}