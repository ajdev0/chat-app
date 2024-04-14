import React from "react";
import "./detail.css";
import { IoDownload } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/zustand/chatStore";
import { useUserStore } from "../../lib/zustand/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked
          ? arrayRemove(user?.id)
          : arrayUnion(user?.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h3>{user?.username}</h3>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <IoIosArrowUp />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy Policy</span>
            <IoIosArrowUp />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photo</span>
            <IoIosArrowDown />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo-2-3.png</span>
              </div>
              <IoDownload />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo-2-3.png</span>
              </div>
              <IoDownload />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img src="https://picsum.photos/200/300" alt="" />
                <span>photo-2-3.png</span>
              </div>
              <IoDownload />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <IoIosArrowDown />
          </div>
        </div>

        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You Are Blocked!"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button className="logoutBtn" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
