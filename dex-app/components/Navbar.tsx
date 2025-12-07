import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { ConnectWallet } from "@thirdweb-dev/react";
import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <Box w="full" borderBottomWidth="1px" borderColor="gray.100">
      <Flex
        maxW="6xl"
        w="full"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        py="5"
        px={{ base: "5", xl: "0" }}
      >
        <Text fontWeight="bold" fontSize="2xl">
          Token DEX
        </Text>
        <Flex gap="4" alignItems="center">
          <Link href="/account">
            <Button colorScheme="blue" variant="outline">
              Account
            </Button>
          </Link>
          <Link href="/fassets">
            <Button colorScheme="orange" variant="outline">
              fAssets
            </Button>
          </Link>
          <Link href="/fassets-simulator">
            <Button colorScheme="teal" variant="outline">
              Simulator
            </Button>
          </Link>
          <Link href="/circuitbreaker">
            <Button colorScheme="purple" variant="outline">
              Circuit Breaker
            </Button>
          </Link>
          <ConnectWallet theme="light" />
        </Flex>
      </Flex>
    </Box>
  );
}
