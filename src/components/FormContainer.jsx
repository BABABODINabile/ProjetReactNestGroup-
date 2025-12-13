import { Formik, Form } from "formik";

export default function FormContainer({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  className = "",
}) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form className={`space-y-4 ${className}`}>
        {children}
      </Form>
    </Formik>
  );
}
