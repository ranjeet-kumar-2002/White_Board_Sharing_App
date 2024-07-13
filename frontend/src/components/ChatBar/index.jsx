import { useEffect, useState } from "react";
const Chat = ({ setOpenChatTab, socket }) => {
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("messageResponse", (data) => {
      setChat((prevChats) => [...prevChats, data]);
    });
  }, [socket]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      socket.emit("message", {message});
      setChat((prevChats) => [...prevChats, { message, name: "You" }]);
      setMessage("");  // Clear the input field after sending a message
    }
  };

  return (
    <div
      className="position-fixed top-0 h-100 text-white bg-dark"
      style={{
        width: "219px", left: "0%"
      }}
    >
      <button type="button"
        onClick={() => setOpenChatTab(false)}
        className="btn btn-light btn-block w-100 mt-5"
      >
        Close
      </button>
      <div className="w-100 mt-5 p-2 border border-1 border-white rounded-2"
        style={{
          height: "67%"
        }}
      >
        {
          chat.map((msg, index) => (
            <p key={index * 999} className="my-2 text-center w-100 py-2 border border-left-0 border-right-0">
              {msg.name}: {msg.message}
            </p>
          ))
        }
      </div>

      <form onSubmit={handleSubmit} className="w-100 mt-4 d-flex rounded-2">
        <input type="text"
          placeholder="Enter message"
          className="h-100 border-0 rounded-0 py-2 px-4"
          style={{
            width: "90%",
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-primary rounded-0">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
