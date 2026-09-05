import { TextField, type TextFieldProps } from '@mui/material';

type ValidatedTextFieldProps = Omit<TextFieldProps, 'error' | 'helperText'> & {
  fieldError: string | undefined;
  hasAttemptedSubmit: boolean;
};

const ValidatedTextField = ({
  fieldError,
  hasAttemptedSubmit,
  ...textFieldProps
}: ValidatedTextFieldProps) => (
  <TextField
    {...textFieldProps}
    error={hasAttemptedSubmit && Boolean(fieldError)}
    helperText={hasAttemptedSubmit ? fieldError : undefined}
  />
);

export default ValidatedTextField;
