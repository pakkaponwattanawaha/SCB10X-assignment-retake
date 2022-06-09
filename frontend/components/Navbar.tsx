import { ConnectButton } from "web3uikit";
import { useRouter } from "next/router";
import Link from "next/link";
import Rocket from "public/Rocket.png";
export const Navbar = () => {
  const router = useRouter();

  const createNavLink = (label: string, endpoint: string) => {
    const activeStyle = router.pathname.endsWith(endpoint)
      ? "text-gray-500 border-b-2 border-main1"
      : "text-white hover:text-gray-400";

    return (
      <Link
        className="flex items-center border border-blue-500"
        href={{ pathname: `${endpoint}` }}
        replace
      >
        <a className={`mr-5 font-medium  ${activeStyle}`}>{label}</a>
      </Link>
    );
  };

  return (
    <div className="absolute w-full">
      <nav className="bg-gray-50 bg-opacity-5 p-5 shadow-xl flex flex-row items-center justify-between text-white ">
        <Link href={{ pathname: "/" }} replace>
          <a>
            <div className="ml-2 mt-[13px] mb-2 flex flex-row items-center border-mainPink justify-center">
              <img className="w-[24px] mr-2" alt="icon" src="/Rocket.png" />
              <h1 className="font-medium  text-xl">10XDev</h1>
            </div>
          </a>
        </Link>
        <div className="flex flex-row items-center justify-between mt-2 pl-36">
          {createNavLink("Lending", "/")}
          {createNavLink("Dashboard", "/dashboard")}
        </div>
        <div className="flex flex-row items-center">
          <div className="flex flex-row py-2 px-4">
            <ConnectButton
              moralisAuth={true}
              signingMessage="Moralis Authentication"
            />
          </div>
        </div>
      </nav>
    </div>
  );
};
