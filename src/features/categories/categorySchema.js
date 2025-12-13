import * as Yup from "yup";

const categorySchema = Yup.object({
  nom: Yup.string().required("Nom obligatoire"),
  type: Yup.string().oneOf(["Dépense", "Recette", "Mixte"]).required("Type obligatoire"),
});

export default categorySchema;