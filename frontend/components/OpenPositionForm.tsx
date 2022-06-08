import Link from "next/link";
import { formDataType } from "types";
import { Dispatch, SetStateAction } from "react";
import { numberToFixedDigit } from "utils";
export const OpenPositionForm = ({
  formData,
  balance,
  setFormData,
}: {
  formData: formDataType;
  balance: number;
  setFormData: Dispatch<SetStateAction<formDataType>>;
}) => {
  const formatted_balance = balance
    ? numberToFixedDigit(balance.toString(), 8)
    : 0;
  return (
    <>
      <div className="grid pt-6 xl:grid-cols-1 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-[18px] font-bold  text-gray-900 dark:text-gray-400"
          >
            Amount
          </label>
          <span className="text-[12px] ">Balance: {formatted_balance} ETH</span>
          <div className="flex flex-row">
            <input
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              value={formData?.amount}
              type="number"
              step="any"
              min="0"
              name="floating_last_name"
              id="floating_last_name"
              className="block py-2.5 px-0 w-full text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <button
              type="button"
              className="bg-main1 hover:bg-blue-700 text-white font-medium px-3 py-2 m-2 rounded focus:outline-none focus:shadow-outline"
              onClick={() =>
                setFormData({
                  ...formData,
                  amount: Number(formatted_balance),
                })
              }
            >
              MAX
            </button>
          </div>
        </div>
      </div>

      <div className="grid pt-6 xl:grid-cols-1 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-[18px] font-bold text-gray-900 dark:text-gray-400"
          >
            Interest Rate Mode
          </label>
          <div className="relative inline-flex">
            <svg
              className="w-2 h-2 absolute top-0 right-0 m-4 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 412 232"
            >
              <path
                d="M206 171.144L42.678 7.822c-9.763-9.763-25.592-9.763-35.355 0-9.763 9.764-9.763 25.592 0 35.355l181 181c4.88 4.882 11.279 7.323 17.677 7.323s12.796-2.441 17.678-7.322l181-181c9.763-9.764 9.763-25.592 0-35.355-9.763-9.763-25.592-9.763-35.355 0L206 171.144z"
                fill="#648299"
                fillRule="nonzero"
              />
            </svg>
            <select
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interestRateMode: Number(e.target.value),
                })
              }
              value={formData?.interestRateMode}
              className="border border-gray-300 rounded-md text-gray-600 h-10 pl-5 pr-10 bg-white hover:border-gray-400 focus:outline-none appearance-none"
              required
            >
              <option disabled>Choose Interest Rate Mode</option>
              <option value={1}>Fixed Rate</option>
              <option value={2}>Variable Rate</option>
            </select>
          </div>
        </div>
      </div>
      <div className="grid pt-6 xl:grid-cols-1 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-[18px] font-bold  text-gray-900 dark:text-gray-400"
          >
            Leverage Percentage
          </label>
          <div className="relative inline-flex items-center">
            <input
              onChange={(e) =>
                setFormData({
                  ...formData,
                  leveragePercentage: Number(e.target.value),
                })
              }
              value={formData?.leveragePercentage}
              type="number"
              step="1"
              min="0"
              max="80"
              name="floating_last_name"
              id="floating_last_name"
              className="py-2.5 px-0 w-[50px] text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              placeholder=" "
              required
            />
            <span className="px-3 text-[16px] font-bold  ">%</span>
          </div>
        </div>
      </div>
    </>
  );
};
