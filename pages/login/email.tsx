import React from "react";
import NewAccount from "../../components/Signup/NewAccount";
import s from "../../styles/Home.module.scss";
import BackHeader from "../../components/Header/BackHeader";
function email() {
  return (
    <>
      <section className={s.login}>
        <BackHeader></BackHeader>
        <NewAccount title="Log in with Email" />
      </section>
    </>
  );
}

export default email;
