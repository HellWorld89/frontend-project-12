import * as yup from 'yup'

export const channelNameSchema = (t, channelNamesOnOpen) => yup.object().shape({
  name: yup
    .string()
    .min(3, t('validation.channelNameLength'))
    .max(20, t('validation.channelNameLength'))
    .test(
      'unique-name',
      t('validation.channelNameUnique'),
      value => !channelNamesOnOpen.has(value?.toLowerCase() || ''),
    )
    .required(t('validation.required')),
})
