import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
} from "@chakra-ui/react";

function LoginForm({ username, password, setUsername, setPassword, handleSubmit, error }) {
  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>
        Admin Login
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl id="username" isRequired mb={4}>
          <FormLabel>Username:</FormLabel>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl id="password" isRequired mb={4}>
          <FormLabel>Password:</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Log in
        </Button>

        {error && (
          <Text mt={4} color="red.500">
            {error}
          </Text>
        )}
      </form>
    </Box>
  );
}

export default LoginForm;
