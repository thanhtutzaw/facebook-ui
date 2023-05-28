import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import router, { useRouter } from "next/router";
import { useEffect, useContext } from "react";
import s from "../styles/Home.module.scss";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import BackHeader from "../components/Header/BackHeader";
import { AppContext, AppProvider } from "../context/AppContext";
import { Props } from "../types/interfaces";
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    // console.log(router.query);
    // console.log(router.query.slug);
    // console.log(router.query.friends);
  }, []);
  // const { setActive } = useContext(AppContext) as Props;
  return (
    <div className="user">
      <BackHeader>
        <h2 className={s.title}>fdddddddddddddddddddddddddddddddddddddddddd</h2>
        {/* <h2>{router.query.friends}</h2> */}
      </BackHeader>

      {/* <p>User: {router.query.friends}</p> */}
    </div>
  );
}
