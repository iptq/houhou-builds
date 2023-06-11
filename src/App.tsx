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
        {navLinks.map((navLink) => {
          const active = (
            navLink.subPaths ? navLink.subPaths : [{ key: navLink.key, path: navLink.path }]
          ).some((item) => matchPath({ path: item.path }, location.pathname));
          const mainPath = navLink.subPaths ? navLink.subPaths[0].path : navLink.path;
          const className = classNames(styles.link, active && styles["link-active"]);
          return (
            <li key={navLink.path}>
              <Link to={mainPath} className={className}>
                {navLink.title}
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
        {navLinks.flatMap((route, idx) => {
          if (route.subPaths) {
            return route.subPaths.map((subRoute, idx) => {
              return (
                <Route
                  key={`${route.key}-${subRoute.key}`}
                  path={subRoute.path}
                  element={route.element}
                />
              );
            });
          } else {
            return (
              <Route key={route.path} index={idx === 0} path={route.path} element={route.element} />
            );
          }
        })}
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

const navLinks = [
  { key: "home", path: "/", title: "Home", element: <HomePane /> },
  { key: "srs", path: "/srs", title: "SRS", element: <SrsPane /> },
  {
    key: "kanji",
    title: "Kanji",
    element: <KanjiPane />,
    subPaths: [
      { key: "index", path: "/kanji" },
      { key: "selected", path: "/kanji/:selectedKanji" },
    ],
  },
  { key: "vocab", path: "/vocab", title: "Vocab", element: <VocabPane /> },
  { key: "settings", path: "/settings", title: "Settings", element: <SettingsPane /> },
];
