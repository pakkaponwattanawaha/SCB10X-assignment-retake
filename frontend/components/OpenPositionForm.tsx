import Link from "next/link";
import { formDataType } from "types";
import { Dispatch, SetStateAction } from "react";
export const OpenPositionForm = ({
  formData,
  setFormData,
}: {
  formData: formDataType;
  setFormData: Dispatch<SetStateAction<formDataType>>;
}) => {
  return (
    <>
      <div className="grid pt-6 xl:grid-cols-2 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-m font-medium text-gray-900 dark:text-gray-400"
          >
            Amount
          </label>
          <input
            onChange={(e) =>
              setFormData({ ...formData, amount: Number(e.target.value) })
            }
            value={formData?.amount}
            type="number"
            step=".001"
            min="0"
            name="floating_last_name"
            id="floating_last_name"
            className="block py-2.5 px-0 w-full text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
        </div>
      </div>
      <div className="grid pt-6 xl:grid-cols-2 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-m font-medium text-gray-900 dark:text-gray-400"
          >
            Interest Rate Mode
          </label>
          <input
            onChange={(e) =>
              setFormData({
                ...formData,
                interestRateMode: Number(e.target.value),
              })
            }
            value={formData?.interestRateMode}
            type="number"
            min="1"
            max="2"
            className="block py-2.5 px-0 w-full text-m text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" "
            required
          />
        </div>
      </div>
      <div className="grid pt-6 xl:grid-cols-2 xl:gap-6">
        <div className="relative z-0 w-full pb-2 group">
          <label
            htmlFor="message"
            className="block text-m font-medium text-gray-900 dark:text-gray-400"
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
            <span className="px-3 ">%</span>
          </div>
        </div>
      </div>
    </>
  );
};
