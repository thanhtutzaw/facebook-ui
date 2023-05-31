import { useRouter } from "next/router";
import BackHeader from "../components/Header/BackHeader";
import s from "../styles/Home.module.scss";
export default function Page() {
  const router = useRouter();
  return (
    <div className="user">
      <BackHeader>
        {/* {active} */}
        <h2 className={s.title}>{router.query.friends}</h2>
      </BackHeader>

      {/* <p>User: {router.query.friends}</p> */}
    </div>
  );
}
