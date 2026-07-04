import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { readAdminJson } from '@/lib/adminResponse';

const updateRating  = async (initName, rating) => {
  try {
    const res = await fetch(`/api/admin/block`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": initName,
        "rating": rating
      }),
    });
    const res_data = await readAdminJson(res);
    if (res_data.success) {
      toast.success('操作成功!');
      return true;
    } else {
      toast.error('操作失败!');
    }
  } catch (error) {
    toast.error(error.message);
  }

  return false;
};

const Switcher = ({ initialChecked, initName }) => {
  const [isChecked, setIsChecked] = useState(initialChecked === 3);
  // const isDisabled = initialChecked > 3;
  // console.log(initName);
  const isDisabled = initName.startsWith('/file') || initName.startsWith('/cfile') || initName.startsWith('/rfile');

  useEffect(() => {
    setIsChecked(initialChecked === 3);
  }, [initialChecked]);

  const handleCheckboxChange = async () => {
    // console.log(isDisabled);
    if (!isDisabled) return;

    const newRating = isChecked ? 1 : 3;
    const updated = await updateRating(initName, newRating);

    if (updated) {
      setIsChecked(!isChecked);
    }
  };




  return (
    <label className="autoSaverSwitch relative inline-flex cursor-pointer select-none items-center">
      <input
        type="checkbox"
        name="autoSaver"
        className="sr-only"
        checked={isChecked}
        onChange={handleCheckboxChange}
        disabled={!isDisabled}
      />
      <span
        className={`slider flex h-4 w-9 items-center rounded-full p-[2px] duration-200 ${isChecked ? 'bg-[#0D6FFF]/25' : 'bg-black/[0.08]'} ${!isDisabled ? 'opacity-45' : ''}`}
      >
        <span
          className={`dot h-[13px] w-[21px] rounded-full bg-white/90 shadow-[0_0_1px_rgba(0,0,0,0.05),0_0_4px_rgba(0,0,0,0.08),0_4px_16px_rgba(0,0,0,0.10),inset_1.75px_1.75px_1px_-1px_#fff,inset_-1.75px_-1.75px_2px_-1px_#fff] duration-200 ${isChecked ? 'translate-x-[11px]' : ''}`}
        ></span>
      </span>

      {/* <span className="label flex items-center text-sm font-medium text-black">
               <span className="pl-1"> {isChecked ? 'On' : 'Off'} </span>
      </span> */}
    </label>
  );
};

export default Switcher;
