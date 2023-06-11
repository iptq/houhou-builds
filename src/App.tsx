import { Link, RouterProvider, createHashRouter } from "react-router-dom";
import styles from "./App.module.scss";
import KanjiPane from "./panes/KanjiPane";
import HomePane from "./panes/HomePane";
import { createBrowserRouter } from "react-router-dom";
import { Outlet, Route, createRoutesFromElements } from "react-router";

function Layout() {
  return (
    <>
      <ul className={styles.header}>
        {routes.map((route) => (
          <li key={route.path}>
            <Link to={route.path}>{route.title}</Link>
          </li>
        ))}
      </ul>

      <Outlet />
    </>
  );
}

export default function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        {routes.map((route, idx) => (
          <Route
            key={route.path}
            index={idx === 0}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

const routes = [
  { path: "/", title: "Home", element: <HomePane /> },
  { path: "/kanji", title: "Kanji", element: <KanjiPane /> },
];
