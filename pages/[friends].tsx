import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useEffect } from "react";
import s from "../styles/Home.module.scss";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import BackHeader from "../components/Header/BackHeader";
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    // console.log(router.query);
    // console.log(router.query.slug);
    // console.log(router.query.friends);
  }, []);

  return (
    <div className="user">
      <BackHeader>
        <h2>{router.query.friends}</h2>
        
      </BackHeader>

      {/* <p>User: {router.query.friends}</p> */}
    </div>
  );
}
