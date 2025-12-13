import * as Yup from "yup";

const transactionSchema = Yup.object({
  type: Yup.string().oneOf(["Dépense", "Recette"]).required("Type obligatoire"),
  categoryId: Yup.number().required("Catégorie obligatoire"),
  amount: Yup.number().typeError("Montant invalide").positive("Doit être supérieur à 0").required("Montant obligatoire"),
  description: Yup.string().nullable(),
  date: Yup.date().required("Date obligatoire"),
  // attachment: optional, we accept an object { name, dataUrl }
});

export default transactionSchema;
