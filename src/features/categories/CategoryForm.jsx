import { Formik, Form } from "formik";
import * as Yup from "yup";
import FormikInput from "../../components/FormikInput";
import FormikSelect from "../../components/FormikSelect";

export default function CategoryForm({ initialValues, onSubmit, onClose }) {
  const schema = Yup.object({
    nom: Yup.string().required("Nom obligatoire"),
    type: Yup.string().oneOf(["Dépense", "Recette"]).required("Type obligatoire"),
  });

  return (
    <Formik initialValues={initialValues} validationSchema={schema} onSubmit={onSubmit}>
      <Form className="space-y-4">

        <FormikInput name="nom" label="Nom de la catégorie" />

        <FormikSelect
          name="type"
          label="Type"
          options={[
            { value: "Dépense", label: "Dépense" },
            { value: "Recette", label: "Recette" },
          ]}
        />

        <div className="flex justify-end gap-8 mt-6">
          <button
            type="button"
            className="px-4 py-2 hover:bg-red-500 font-bold hover:font-bold hover:text-white border border-red-500 bg-white text-red-600 rounded"
            onClick={onClose}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-bold active:scale-95 rounded"
          >
            Enregistrer
          </button>
        </div>
      </Form>
    </Formik>
  );
}
