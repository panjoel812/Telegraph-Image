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
        className={`slider mr-3 flex h-[26px] w-[50px] items-center rounded-full border border-white/60 p-1 shadow-inner duration-200 ${isChecked ? 'bg-sky-500/90' : 'bg-slate-300/80'} ${!isDisabled ? 'opacity-45' : ''}`}
      >
        <span
          className={`dot h-[18px] w-[18px] rounded-full bg-white shadow-sm duration-200 ${isChecked ? 'translate-x-6' : ''}`}
        ></span>
      </span>

      {/* <span className="label flex items-center text-sm font-medium text-black">
               <span className="pl-1"> {isChecked ? 'On' : 'Off'} </span>
      </span> */}
    </label>
  );
};

export default Switcher;
