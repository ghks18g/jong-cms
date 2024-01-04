/**
 */

import React, { useEffect } from "react";
import {
  AppBar,
  Box,
  Container,
  Grid,
  IconButton,
  Toolbar,
  useMediaQuery,
  useTheme,
  Icon,
} from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { encode } from "querystring";

import * as path from "path";
import Router from "next/router";

interface ILoginLayout {
  children: any;
  showChangeLocale?: boolean;
}

function LoginLayout({
  showChangeLocale: showChangeLocale,
  children,
}: ILoginLayout) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { query } = useRouter();
  const backUri = query.back_uri as string;
  const router = useRouter();
  return (
    <Container maxWidth="sm" disableGutters sx={{ position: "relative" }}>
      <Grid
        container
        spacing={0}
        direction="row"
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: "100vh" }}
      >
        {/* <Grid item xs={12}>
          <Paper elevation={isMobile ? 0 : 2}> */}
        <Grid container spacing={0}>
          <Grid item xs={12}>
            {backUri ? (
              <AppBar
                position={isMobile ? "fixed" : "static"}
                color="transparent"
                elevation={0}
              >
                <Container maxWidth="sm" disableGutters>
                  <Toolbar>
                    {backUri ? (
                      <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={() => {
                          router.replace(backUri);
                        }}
                      >
                        <ArrowBackIcon />
                      </IconButton>
                    ) : undefined}
                  </Toolbar>
                </Container>
              </AppBar>
            ) : undefined}
            <Container maxWidth="sm">
              <Box mt={12} mb={12}>
                {children}
              </Box>
            </Container>
          </Grid>
        </Grid>
        {/* </Paper>
        </Grid> */}
      </Grid>
    </Container>
  );
}

export default LoginLayout;
