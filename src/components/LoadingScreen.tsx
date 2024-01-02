import { CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const RootStyle = styled("div")(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: "100%",
  height: "100%",
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
}));

export default function LoadingScreen() {
  return (
    <RootStyle>
      <CircularProgress />
    </RootStyle>
  );
}
