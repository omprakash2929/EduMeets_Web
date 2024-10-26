import React, { useContext } from "react";
import { UIContext } from "../../../hooks/context/UIContext";
import { textSlice } from "../../../utils";
import { RenderAvatar } from "../../../utils/RenderAvatar";
import moment from "moment";
import { IMessage } from "../../../types/chats.interface";

export const ChatBubble: React.FC<{ messages: IMessage[] }> = ({ messages }) => {
  const { theme } = useContext(UIContext);
  return (
    <div className={`w-full h-full px-4 space-y-2  overflow-auto  `}>
      {messages.map((message) => (
        <div key={(message._id || "") + Math.random()} className="flex space-x-2 mb-3">
          <div className="flex space-x-3 flex-1">
            <RenderAvatar
              photo={message.sender.photo}
              fullName={message.sender.full_name}
              hasExtraClass="w-8 h-8 rounded-full "
            />
            <div
              className={`flex-1 py-2 rounded-md ${
                theme === "dark" ? "bg-blue-800 " : "bg-white-100 border border-gray-800"
              }`}
            >
              <p
                className={` w-full text-xs font-light px-2 ${
                  theme === "dark" ? "text-transparent-300" : " text-black-400"
                }`}
              >
                {textSlice(message.sender.full_name, 10)}
              </p>
              <p
                className={` w-full text-xs font-smi-bold pt-1 px-3 ${
                  theme === "dark" ? "text-white-800" : "text-black-600 "
                }`}
              >
                {message.content}
              </p>
            </div>
          </div>
          <p
            className={` text-xs font-light ${
              theme === "dark" ? "text-transparent-300" : "text-black-400"
            }`}
          >
            {moment(message.timestamp).format("hh:mm A")}
          </p>
        </div>
      ))}
    </div>
  );
};
