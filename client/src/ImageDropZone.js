import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Text } from "@chakra-ui/react";

const ImageDropZone = ({ onImageChange }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
  });

  return (
    <Box
      {...getRootProps()}
      width="100%"
      minHeight="200px"
      backgroundColor={isDragActive ? "gray.100" : "gray.50"}
      border="2px dashed"
      borderColor="gray.300"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Text fontSize="xl">Drop the image here</Text>
      ) : (
        <Text fontSize="xl">Drag or click to select an image</Text>
      )}
    </Box>
  );
};

export default ImageDropZone;
