import React from "react";
import type { NextPage } from "next";
import { useLendingFactory } from "hooks/useLendingFactory";
import { Loading } from "web3uikit";

const Dashboard: NextPage = () => {
  const { allPositionOpened, isLoading } = useLendingFactory();
  return (
    <div>
      dashboard
      {isLoading ? (
        <Loading size={40} spinnerColor="#0A0A0A" />
      ) : (
        <>{allPositionOpened.toString()}</>
      )}
    </div>
  );
};
export default Dashboard;
