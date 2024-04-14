import React from "react";
import { MdMoreHoriz, MdOutlineVideocam } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import "./userInfo.css";
import { useUserStore } from "../../../lib/zustand/userStore";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser?.avatar || "./avatar.png"} alt="" />
        <h3>{currentUser?.username}</h3>
      </div>
      <div className="icons">
        <div className="icon">
          <MdMoreHoriz size={20} />
        </div>
        <div className="icon">
          <MdOutlineVideocam size={20} />
        </div>
        <div className="icon">
          <FiEdit size={20} />
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
