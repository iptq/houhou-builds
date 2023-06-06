import { RouterProvider, createBrowserRouter } from "react-router-dom";
import styles from "./App.module.scss"
import KanjiPane from "./panes/KanjiPane";
import HomePane from "./panes/HomePane";

export default function App() {
  const router = createBrowserRouter(routes);

  return (
    <>
      <ul className={styles.header}>
        <li><a href="/">Home</a></li>
        <li><a href="/srs">Srs</a></li>
        <li><a href="/kanji">Kanji</a></li>
        <li><a href="/vocab">Vocab</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>

      <RouterProvider router={router} />
    </>
  );
}

const routes = [
  { path: "/", element: <HomePane /> },
  { path: "/kanji", element: <KanjiPane /> },
];