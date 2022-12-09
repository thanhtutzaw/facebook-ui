import React, { PropsWithChildren } from 'react'
import styles from "../styles/Home.module.css";
import { Header } from './Header';

export default function Layout({children}:PropsWithChildren) {
  return (
    <>
      <main className={styles.main}>
        <Header />
        {children}
      </main>
    </>
  );
}

