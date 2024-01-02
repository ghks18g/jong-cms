import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "src/styles/Home.module.css";
import { ReactElement } from "react";
import Layout from "client/layouts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>root page contents </div>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout variant="root">{page}</Layout>;
};
