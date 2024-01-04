import { useEffect } from "react";
import { useFormik, FormikConfig, FormikValues, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";

const initialValues = {
  identity: "",
  // password: '',
};
export type IFormikSubmit = (
  values: FormikValues,
  formikHelpers: FormikHelpers<FormikValues>
) => void | Promise<any>;

export function useIdentityFormik(
  onSubmit: IFormikSubmit,
  options?: Partial<FormikConfig<FormikValues>>
) {
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object().shape({
    identity: Yup.string()
      // TODO: 전화번호 로그인 추가시 이메일 형식 체크 없애야함
      .email("이메일 형식이 아닙니다.")
      .required("이메일은 필수 입력 입니다."),
  });
  const formik = useFormik({
    ...options,
    initialValues: {
      ...initialValues,
      ...options?.initialValues,
    },
    validationSchema,
    onSubmit,
  });

  useEffect(() => {
    if (formik.submitCount > 0 && !formik.isSubmitting && !formik.isValid) {
      enqueueSnackbar("누락된 입력 항목을 확인해주세요.", {
        variant: "error",
      });
    }
  }, [formik.submitCount, formik.isSubmitting]);

  return formik;
}
