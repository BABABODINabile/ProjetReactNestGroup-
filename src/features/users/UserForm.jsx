import { Formik, Form } from "formik";
import userSchema from "./userSchema";
import FormikInput from "../../components/FormikInput";
import FormikSelect from "../../components/FormikSelect";

export default function UserForm({ initialValues, onSubmit, onClose }) {

    return (
        <Formik initialValues={initialValues} validationSchema={userSchema} onSubmit={onSubmit}>
            <Form className="space-y-4">
                <FormikInput name="firstname" label="Nom" />
                <FormikInput name="name" label="Prénom" />
                <FormikInput name="email" label="Email" type="email" />
                <FormikInput name="password" label="Mot de passe" type="password" />
                <FormikSelect name="role_id" label="Rôle"
                    options={[
                        { value: "1", label: "Directeur" },
                        { value: "2", label: "Comptable" },
                    ]}>
                    
                    
                </FormikSelect>
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
                        Ajouter
                    </button>
                </div>
            </Form>
        </Formik>
    );
}