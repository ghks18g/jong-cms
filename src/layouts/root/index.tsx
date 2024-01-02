import { Box, Stack } from "@mui/material";
import { ReactNode } from "react";
import HeaderAppBar from "./HeaderAppBar";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <Stack sx={{ minHeight: 1 }}>
      <HeaderAppBar />
      {children}
      <Box sx={{ flexGrow: 1 }} />
    </Stack>
  );
}
