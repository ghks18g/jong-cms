import { useRouter } from "next/router";
import { ReactNode } from "react";
import RootLayout from "./root";
import { GetServerSideProps } from "next";
import AuthGuard from "client/guards/AuthGuard";

type Props = {
  children: ReactNode;
  variant?: "root";
};

export default function Layout({ variant = "root", children }: Props) {
  const router = useRouter();

  //TODO :  check token verify

  // TODO : return Layout Components and AuthGuard
  return (
    // <AuthGuard>
    <RootLayout>{children}</RootLayout>
    // </AuthGuard>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  // locale,
  query,
}) => {
  // locale = locale ?? (query.locale as string);

  return {
    props: {},
  };
};
