import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import { PiInfo, PiPhone } from "react-icons/pi";
import { BiCamera, BiImage, BiMicrophone, BiVideoPlus } from "react-icons/bi";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/zustand/chatStore";
import { useUserStore } from "../../lib/zustand/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleImage = (e) => {
    if (e.target.files[0]) {
      setImage({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleSend = async () => {
    if (text === null) return;
    let imgUrl = null;
    try {
      if (image.file) {
        imgUrl = await upload(image.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();
          const chatIndex = userChatData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, { chats: userChatData.chats });
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImage({ file: null, url: "" });
    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
        </div>
        <div className="icons">
          <div className="icon">
            <PiPhone />
          </div>
          <div className="icon">
            <BiVideoPlus />
          </div>
          <div className="icon">
            <PiInfo />
          </div>
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((msg) => (
          <div
            className={
              msg.senderId === currentUser.id ? "message own" : "message"
            }
            key={msg?.createdAt}
          >
            <div className="texts">
              {msg.img && <img src={msg.img} alt="" />}
              <p>{msg.text}</p>
              {/*  <span>{msg.createdAt}</span>*/}
            </div>
          </div>
        ))}
        {image?.url && (
          <div className="message own">
            <div className="texts">
              <img src={image.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <div className="icon">
              <BiImage />
            </div>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleImage}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
          </label>
          <div className="icon">
            <BiCamera />
          </div>

          <div className="icon">
            <BiMicrophone />
          </div>
        </div>
        <input
          type="text"
          value={text}
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You can't message this user"
              : "Type a message..."
          }
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <BsEmojiSmile onClick={() => setOpen((prev) => !prev)} />
          <div className="picker ">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
