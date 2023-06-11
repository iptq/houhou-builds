import { Link, RouterProvider, createHashRouter } from "react-router-dom";
import classNames from "classnames";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import { createBrowserRouter } from "react-router-dom";
import { Outlet, Route, createRoutesFromElements, matchPath, useLocation } from "react-router";
import { StrictMode } from "react";

import styles from "./App.module.scss";

function Layout() {
  const location = useLocation();

  return (
    <Flex className={styles.main} direction="column" alignSelf="start">
      <ul className={styles.header}>
        {navLinks.map((navLink: NavLink) => {
          const active = (
            navLink.subPaths ? navLink.subPaths : [{ key: navLink.key, path: navLink.path }]
          ).some((item) => matchPath({ path: item.path }, location.pathname));
          const mainPath = navLink.subPaths ? navLink.subPaths[0].path : navLink.path;
          const className = classNames(styles.link, active && styles["link-active"]);

          return (
            <li key={`navLink-${navLink.key}`}>
              <Link to={mainPath} className={className}>
                {navLink.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.body}>
        <Outlet />
      </div>
    </Flex>
  );
}

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        {navLinks.flatMap((route, idx) => {
          if (route.subPaths) {
            return route.subPaths.map((subRoute, idx2) => {
              return (
                <Route
                  key={`route-${route.key}-${subRoute.key}`}
                  index={idx + idx2 == 0}
                  path={subRoute.path}
                  lazy={() => import(`./panes/${subRoute.element ?? route.element}.tsx`)}
                />
              );
            });
          } else {
            return (
              <Route
                key={`route-${route.key}`}
                index={idx == 0}
                path={route.path}
                lazy={() => import(`./panes/${route.element}.tsx`)}
              />
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

type NavLinkPath =
  | {
      path: string;
      subPaths?: undefined;
    }
  | {
      path?: undefined;
      subPaths: { key: string; path: string; element?: string }[];
    };
type NavLink = {
  key: string;
  title: string;
  element: string;
} & NavLinkPath;

const navLinks: NavLink[] = [
  // { key: "home", path: "/", title: "Home", element: <HomePane /> },
  {
    key: "srs",
    title: "SRS",
    element: "SrsPane",
    subPaths: [
      { key: "index", path: "/" },
      { key: "review", path: "/srs/review", element: "SrsReviewPane" },
    ],
  },
  {
    key: "kanji",
    title: "Kanji",
    element: "KanjiPane",
    subPaths: [
      { key: "index", path: "/kanji" },
      { key: "selected", path: "/kanji/:selectedKanji" },
    ],
  },
  { key: "vocab", path: "/vocab", title: "Vocab", element: "VocabPane" },
  { key: "settings", path: "/settings", title: "Settings", element: "SettingsPane" },
];
