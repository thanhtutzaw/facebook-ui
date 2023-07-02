import React from "react";
import NewAccount from "../../components/Form/NewAccount";
import s from "../../styles/Home.module.scss";
function email() {
  return (
    <>
      <section className={s.login}>
        <NewAccount title="Log in with Email" />
      </section>
    </>
  );
}

export default email;
