import React, { PropsWithChildren } from 'react'
import styles from "../styles/Home.module.css";
import { Header } from './Header';

export default function Layout({children}:PropsWithChildren) {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.headerContainer}>
          <Header />
        </div>
        {children}
      </main>
    </>
  );
}

