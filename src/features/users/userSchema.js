import * as yup from 'yup';

const userSchema = yup.object({
    firstname: yup.string().required('Nom obligatoire'),
    name: yup.string().required('Prénom obligatoire'),
    email: yup.string().email('Email invalide').required('Email obligatoire'),
    password: yup.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères').required('Mot de passe obligatoire'),
    role_id: yup.string().oneOf(['1', '2'], 'Rôle invalide').required('Rôle obligatoire'),
});

export default userSchema;
