import rough from "roughjs";
import { useEffect, useLayoutEffect, useState } from "react";
import { Socket } from "socket.io-client";

const roughGenerator = rough.generator();

const WhiteBoard = ({ canvasRef, ctxRef, elements, setElements, tool,color,user,socket}) => {

  const [img,setImg] = useState(null);

  useEffect (()=>{
  socket.on("whiteBoardDataResponse",(data)=>{
      setImg(data.imgURL);
   });
  },[])

  if(!user?.presenter){
    return (
    <div
      className="border border-dark border-3 h-100 w-100 overflow-hidden">
       <img  src = {img} 
       alt = "real time white board image shared by presenter"
       style={{
            height:window.innerHeight*2,
            width:"285%",
        }}
       />
    </div>
  );
}

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round"
    ctxRef.current = ctx;
  }, []);
 

  useEffect(()=>{
   ctxRef.current.strokeStyle = color;
  },[color]);

  useLayoutEffect(() => {
      if(canvasRef){
        const roughCanvas = rough.canvas(canvasRef.current);
        if (elements.length > 0) {
          ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        elements.forEach((element) => {
          if(element.type==="rect"){
            roughCanvas.draw(
            roughCanvas.rectangle(
              element.offsetX,
               element.offsetY,
               element.endX,
               element.endY,
               {
                 stroke:element.stroke,
                 strokeWidth:2,
                 roughness:0
                }
              )
            );
            
          }
            
          else if (element.type === "line") {
            roughCanvas.draw(
              roughGenerator.line(
                element.offsetX,
                element.offsetY,
                element.endX,
                element.endY,
                {
              stroke:element.stroke,
              strokeWidth:2,
              roughness:0
            }
          )
        );
      }
          else if (element.type === "pencil") {
            roughCanvas.linearPath(element.path, {
              stroke:element.stroke,
              strokeWidth:2,
              roughness:0
            });
          } 
      });
      const canvasImage = canvasRef.current.toDataURL();
      socket.emit("whiteboardData",canvasImage);
   }
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (tool === "pencil") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
        },
      ]);
    } else if (tool === "line") {
      setElements((prevElements) => [
        ...prevElements,
        {
          type: "line",
          offsetX,
          offsetY,
          endX: offsetX,
          endY: offsetY,
          stroke: color,
        },
      ]);
    }

    else if(tool==='rect'){
        setElements((prevElements)=>[
          ...prevElements,
          {
             type:"rect",
             offsetX,
             offsetY,
             endX:offsetX,
             endY:offsetY,
             storke:color,
          },
        ]);
    }
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                path: newPath,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "line") {
        setElements((prevElements) =>
          prevElements.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                endX: offsetX,
                endY: offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      }

      else if(tool==="rect"){
          setElements((prevElements)=>
            prevElements.map((ele,index)=>{
                if(index===elements.length-1){
                   return {
                       ...ele,
                       endX:offsetX-ele.offsetX,
                       endY:offsetY-ele.offsetY,
                   };
                }else{
                  return ele;
                }
            })
         )
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };


  return (<div
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
export default WhiteBoard;
