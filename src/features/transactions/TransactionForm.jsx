import { Formik, Form } from "formik";
import FormikInput from "../../components/FormikInput";
import FormikSelect from "../../components/FormikSelect";
import transactionSchema from "./transactionSchema";
import { useEffect, useState } from "react";
import { getCategories } from "../categories/categories.service";
import { FaPaperclip, FaTrashAlt } from "react-icons/fa";

export default function TransactionForm({ initialValues, onSubmit, onClose }) {
  const [categories, setCategories] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCategories().then((c) => {
      if (mounted) setCategories(c || []);
    });
    return () => (mounted = false);
  }, []);

  // Helper to convert File to dataURL (base64)
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });

  return (
    <Formik initialValues={initialValues} validationSchema={transactionSchema} onSubmit={onSubmit} enableReinitialize>
      {({ values, setFieldValue, isSubmitting }) => (
        <Form>
          <div className="bg-white rounded-lg shadow-md border w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Transaction</h3>
                <p className="text-sm text-gray-500">Enregistrer une dépense ou une recette</p>
              </div>
              <div className="text-sm text-gray-500">*
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormikSelect
                  name="type"
                  label="Type"
                  options={[
                    { value: "Dépense", label: "Dépense" },
                    { value: "Recette", label: "Recette" },
                  ]}
                />
              </div>

              <div>
                <FormikSelect
                  name="categoryId"
                  label="Catégorie"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>

              <div>
                <FormikInput name="amount" label="Montant (FCFA)" type="number" step="0.01" />
                <p className="text-xs text-gray-400 mt-1">Saisissez le montant en francs CFA.</p>
              </div>

              <div>
                <FormikInput name="date" label="Date" type="date" />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 font-medium text-gray-700">Description</label>
              <textarea
                value={values.description || ""}
                onChange={(e) => setFieldValue("description", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Ajouter une note ou un commentaire (facultatif)"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 font-medium text-gray-700 flex items-center gap-2">Pièce jointe (optionnelle)
                <span className="text-xs text-gray-400">PNG, JPG, PDF</span>
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                    if (!f) return;
                    try {
                      const dataUrl = await fileToDataUrl(f);
                      setFieldValue("attachment", { name: f.name, dataUrl, size: f.size });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className={`w-full sm:w-auto flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors border-2 ${dragActive ? "border-blue-400 bg-blue-50" : "border-dashed border-gray-300 bg-white hover:bg-gray-50"}`}
                >
                  <FaPaperclip className="text-gray-600" />
                  <div className="text-sm text-gray-600">Glisser-déposer un fichier ici ou</div>
                  <label className="text-sm text-blue-600 underline ml-1 cursor-pointer">
                    sélectionner
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={async (e) => {
                        const f = e.currentTarget.files && e.currentTarget.files[0];
                        if (!f) return setFieldValue("attachment", null);
                        try {
                          const dataUrl = await fileToDataUrl(f);
                          setFieldValue("attachment", { name: f.name, dataUrl, size: f.size });
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {values.attachment && (
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200 w-full sm:w-auto">
                    {values.attachment.dataUrl && values.attachment.dataUrl.startsWith("data:image") ? (
                      <img src={values.attachment.dataUrl} alt="preview" className="w-14 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">PDF</div>
                    )}
                    <div className="text-sm text-gray-700 max-w-xs">
                      <div className="font-medium truncate max-w-[12rem]">{values.attachment.name}</div>
                      <div className="text-xs text-gray-400">{(values.attachment.size && `${(values.attachment.size/1024).toFixed(1)} KB`) || "Fichier sélectionné"}</div>
                    </div>
                    <button type="button" onClick={() => setFieldValue("attachment", null)} className="ml-2 text-red-500 hover:text-red-700">
                      <FaTrashAlt />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button type="button" className="px-4 py-2 hover:bg-red-500 font-bold hover:font-bold hover:text-white border border-red-500 bg-white text-red-600 rounded" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded shadow" disabled={isSubmitting}>
                Enregistrer
              </button>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
