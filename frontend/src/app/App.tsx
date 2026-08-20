import { RouterProvider } from "react-router";
import { router } from "./routes";
import { CVDemo } from "./pages/CVDemo";

/* MARKER-MAKE-KIT-INVOKED */

export default function App() {
  return <RouterProvider router={router} />;
}
