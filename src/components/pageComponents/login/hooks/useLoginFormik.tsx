/**
 * @author BounceCode, Inc.
 * @packageDocumentation
 */

import { useEffect } from "react";
import { useFormik, FormikConfig, FormikValues, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";

const initialValues = {
  identity: "",
  password: "",
};
export type IFormikSubmit = (
  values: FormikValues,
  formikHelpers: FormikHelpers<FormikValues>
) => void | Promise<any>;

export function useLoginFormik(
  onSubmit: IFormikSubmit,
  options?: Partial<FormikConfig<FormikValues>>
) {
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object().shape({
    identity: Yup.string()
      .email("이메일 형식이 아닙니다.")
      .required("이메일은 필수 입력항목 입니다."),
    password: Yup.string().required("비밀번호를 입력해주세요."),
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
    //   "비밀번호는 최소 9자 이상으로 알파벳 대소문자와 숫자, 특수문자가 최소 1개 포함되어야합니다."
    // ),
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
      enqueueSnackbar(formik?.errors?.password as string, {
        variant: "error",
      });
    }
  }, [formik.submitCount, formik.isSubmitting]);

  return formik;
}
