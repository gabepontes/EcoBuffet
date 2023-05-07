import React from "react";
import { useDrag } from "react-dnd";

const ImageItem = ({ src, alt }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { src, alt },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={src}
      alt={alt}
      style={{ opacity: isDragging ? 0.5 : 1, cursor: "grab" }}
    />
  );
};

export default ImageItem;
