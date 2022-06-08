import { ConnectButton } from "web3uikit";
import { useRouter } from "next/router";
import Link from "next/link";
export const Navbar = () => {
  const router = useRouter();

  const createNavLink = (label: string, endpoint: string) => {
    const activeStyle = router.pathname.endsWith(endpoint)
      ? "text-black border-b-2 border-main1"
      : "text-gray-500 hover:text-black";

    return (
      <Link
        className="flex items-center border border-blue-500"
        href={{ pathname: `${endpoint}` }}
        replace
      >
        <a className={`mr-5 font-medium ${activeStyle}`}>{label}</a>
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-gray-200 p-5 flex flex-row items-center justify-between">
        <Link href={{ pathname: "/" }} replace>
          <a>
            <div className="mb-2 flex flex-row items-center border-main1 justify-center">
              <h1 className="font-medium ml-2 mt-[13px] text-xl">10XDev</h1>
            </div>
          </a>
        </Link>
        <div className="flex flex-row items-center justify-between mt-2 ml-8">
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
    </>
  );
};
