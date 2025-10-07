import * as yup from 'yup'

export const loginSchema = t => yup.object().shape({
  username: yup.string().required(t('validation.required')),
  password: yup.string().required(t('validation.required')),
})

export const signupSchema = t => yup.object().shape({
  username: yup
    .string()
    .min(3, t('validation.usernameLength'))
    .max(20, t('validation.usernameLength'))
    .required(t('validation.required')),
  password: yup
    .string()
    .min(6, t('validation.passwordMin'))
    .required(t('validation.required')),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], t('validation.passwordsMatch'))
    .required(t('validation.required')),
})
