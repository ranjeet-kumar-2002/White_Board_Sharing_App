import { useRef, useState ,useEffect} from "react";
import "./index.css";
import WhiteBoard from "../../components/Whiteboard";
import Chat from "../../components/ChatBar";

  const Roompage = ({user,socket,users}) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("pencil");
  const [color,setColor] = useState("black");
  const [elements,setElements] = useState([]);
  const [history,setHistory] = useState([]);
  const [openUserTab,setOpenUserTab] = useState(false);
  const [openChatTab,setOpenChatTab] = useState(false);

  useEffect(()=>{
    return ()=>{
       socket.emit("userLeft",user);
    }
  },[])

  const handleCanvasClear =()=>{
     const canvas  = canvasRef.current;
     const ctx = canvas.getContext("2d");
     ctx.fillRect = "white";
     ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);
     setElements([]);
  }

  const undo = () => {
    if (elements.length === 0) return; // Prevent undo if there are no elements
    setHistory((prevHistory) => [
      ...prevHistory,
      elements[elements.length - 1],
    ]);
    setElements((prevElements) =>
      prevElements.slice(0, prevElements.length - 1)
    );
  };

  const redo = () => {
    if (history.length === 0) return; // Prevent redo if there are no elements in history
    setElements((prevElements) => [
      ...prevElements,
      history[history.length - 1],
    ]);
    setHistory((prevHistory) =>
      prevHistory.slice(0, prevHistory.length - 1)
    );
  };


  return (
    <div className="row">

      <button type = "button" 
      className = "btn btn-dark" 
      style={{ 
        display:"block",
        position:"absolute", 
        top:"3%",
        left:"1%",
        height :"40px",
        width:"100px"
      }}
      onClick={()=>setOpenUserTab(true)}
      >
        Users
      </button>
      
      <button type = "button" 
      className = "btn btn-primary" 
      style={{ 
        display:"block",
        position:"absolute", 
        top:"3%",
        left:"9%",
        height :"40px",
        width:"100px"
      }}
      onClick={()=>setOpenChatTab(true)}
      >
        Chats
      </button>


      {openUserTab && (
          <div 
          className="position-fixed top-0 h-100 text-white bg-dark "
          style={{
             width:"135px",left:"0%"
              }}
          > 
          <button type="button" 
          onClick = {()=>setOpenUserTab(false)}
          className="btn btn-light btn-block w-100 mt-5" 
          >Close
          </button>
          <div className="w-100 mt-5 pt-5">
          {
             users.map((usr,index)=>(
              <p key={index*999} className="my-2 text-center w-100">
                {usr.name} {user && user.userId===usr.userId && "(You)"}
                </p>
            ))
          }
          </div>
          </div>
         )}

    {openChatTab && <Chat setOpenChatTab = {setOpenChatTab} socket={socket}/>}

      <h1 className="text-center">White Board Sharing App <span className="text-success">[Users Online: {users.length}]</span>
      </h1>
           {
              user?.presenter && (
              <div className = "col-md-10 mx-auto px-5 mb-3 d-flex align-items-center justify-content-center" >
              <div className="d-flex col-md-2 justify-content-center gap-1">
                <div className="d-flex gap-1 align-items-center">
                  <label htmlFor="pencil">Pencil</label>
                  <input
                    type="radio"
                    id="pencil"
                    name="tool"
                    checked ={tool==="pencil"}
                    value="pencil"
                    className="mt-1"
                    onChange={(e) => setTool(e.target.value)}
                  />
                </div>
  
                <div className="d-flex gap-1 align-items-center">
                  <label htmlFor="line">Line</label>
                  <input
                    type="radio"
                    name="tool"
                    id="line"
                    checked ={tool==="line"}
                    value="line"
                    className="mt-1"
                    onChange={(e) => setTool(e.target.value)}
                  />
                </div>
  
                <div className="d-flex gap-1 align-items-center">
                  <label htmlFor="rect">Rectangle</label>
                  <input
                    type="radio"
                    name="tool"
                    id="rect"
                    checked ={tool==="rect"}
                    value="rect"
                    className="mt-1"
                    onChange={(e) => setTool(e.target.value)}
                  />
                </div>
            </div>
  
              <div className="col-md-3 mx-auto">
                  <div className="d-flex align-items-center justify-content-center">
                      <label htmlFor="color">Select Color:</label>
                      <input type="color"
                        id="color"
                        className="mt-1 ms-3"
                        value={color}
                        onChange={(e)=> setColor(e.target.value)}
                      />
                  </div>
              </div>
  
              <div className="col-md-3 d-flex gap-2">
                <button className="btn btn-primary mt-1"
                disabled = {elements.length===0}
                onClick= {()=>undo()}
                >Undo</button>
                <button className="btn btn-outline-success mt-1"
                disabled = {elements.length<1}
                onClick={()=>redo()}
                >Redo</button>
              </div>
              <div className="col-md-2">
                <button className="btn btn-danger" onClick={handleCanvasClear}>Clear Canvas</button>
              </div>
              </div>
            )
           }

       <div className="col-md-10 mx-auto mt-4 canvas-box">
        <WhiteBoard 
        canvasRef ={canvasRef} 
        ctxRef ={ctxRef}
        elements = {elements}
        setElements ={setElements}
        tool = {tool}
        color = {color}
        user = {user}
        socket = {socket}
        />
       </div>

    </div>
  );
};
export default Roompage;
