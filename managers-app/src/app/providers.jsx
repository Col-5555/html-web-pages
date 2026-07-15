"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";

// Client-side providers wrapper. In the App Router, the root layout is a Server
// Component, so anything that needs React context (like the Redux store) must
// live in a Client Component. This wraps the whole app in the Redux <Provider>.
export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
