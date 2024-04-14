import React, { useState, useEffect } from "react";
import "./chatList.css";
import { FaSearch } from "react-icons/fa";
import { IoIosAdd, IoIosRemove } from "react-icons/io";
import AddUser from "./addUser/AddUser";
import { db } from "../../../lib/firebase";
import { useUserStore } from "../../../lib/zustand/userStore";
import { useChatStore } from "../../../lib/zustand/chatStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [search, setSearch] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat, chatId } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        //setChats(doc.data());'
        const chatItems = res.data().chats;

        const promises = chatItems.map(async (chat) => {
          const userDocRef = doc(db, "users", chat.reciverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          //console.log(chat);

          return { ...chat, user };
        });
        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );
    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((chat) => {
      const { user, ...rest } = chat;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChat = chats.filter((c) =>
    c.user.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <div className="iconSearch">
            <FaSearch />
          </div>
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="iconAdd" onClick={() => setAddMode((prev) => !prev)}>
          {addMode ? <IoIosRemove size={18} /> : <IoIosAdd size={18} />}
        </div>
      </div>
      {filteredChat.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen
              ? "transparent"
              : "rgb(94, 147, 41,0.5)",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>{" "}
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
