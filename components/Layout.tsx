import React, { PropsWithChildren } from 'react'
import styles from "../styles/Home.module.css";
import { Header } from './Header';

export default function Layout({children}:PropsWithChildren) {
  // const {test} = props;
  return (
    <>
    {/* {props.uid} */}
      <main className={styles.main}>
        {/* <div className={styles.headerContainer}>
          <Header />
        </div> */}
        {children}
        {/* {children.props.uid} */}
      </main>
    </>
  );
}

