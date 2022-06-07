import React from "react";
import Router from "next/router";
import type { NextPage } from "next";
import { useRouter } from "next/router";
const Pid: NextPage = () => {
  const router = useRouter();
  const { pid } = router.query;
  return <div>pid:{pid}</div>;
};
export default Pid;
