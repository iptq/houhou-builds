import { Link, RouterProvider, createHashRouter } from "react-router-dom";
import KanjiPane from "./panes/KanjiPane";
import classNames from "classnames";
import { ChakraProvider } from "@chakra-ui/react";
import HomePane from "./panes/HomePane";
import { createBrowserRouter } from "react-router-dom";
import { Outlet, Route, createRoutesFromElements, matchPath, useLocation } from "react-router";
import SrsPane from "./panes/SrsPane";
import VocabPane from "./panes/VocabPane";
import SettingsPane from "./panes/SettingsPane";
import { StrictMode } from "react";

import styles from "./App.module.scss";

function Layout() {
  const location = useLocation();

  return (
    <main className={styles.main}>
      <ul className={styles.header}>
        {routes.map((route) => {
          if (!route.title) return undefined;
          const active = matchPath({ path: route.path }, location.pathname);
          const className = classNames(styles.link, active && styles["link-active"]);
          return (
            <li key={route.path}>
              <Link to={route.path} className={className}>
                {route.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <Outlet />
    </main>
  );
}

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        {routes.map((route, idx) => (
          <Route key={route.path} index={idx === 0} path={route.path} element={route.element} />
        ))}
      </Route>,
    ),
  );

  return (
    <StrictMode>
      <ChakraProvider>
        <RouterProvider router={router} />
      </ChakraProvider>
    </StrictMode>
  );
}

const routes = [
  { key: "home", path: "/", title: "Home", element: <HomePane /> },
  { key: "srs", path: "/srs", title: "SRS", element: <SrsPane /> },
  { key: "kanji", path: "/kanji", title: "Kanji", element: <KanjiPane /> },
  { key: "kanjiSelected", path: "/kanji/:selectedKanji", element: <KanjiPane /> },
  { key: "vocab", path: "/vocab", title: "Vocab", element: <VocabPane /> },
  { key: "settings", path: "/settings", title: "Settings", element: <SettingsPane /> },
];
