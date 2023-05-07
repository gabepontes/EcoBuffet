import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
} from "@chakra-ui/react";

function Login({ setUsername, setPassword, handleLogin }) {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Admin Login
      </Heading>
      <form onSubmit={handleLogin}>
        <FormControl id="username" isRequired mb={4}>
          <FormLabel>Username:</FormLabel>
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" isRequired mb={4}>
          <FormLabel>Password:</FormLabel>
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Login
        </Button>
      </form>
    </Box>
  );
}

export default Login;
