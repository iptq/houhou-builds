import { invoke } from "@tauri-apps/api/tauri";
import useSWR, { useSWRConfig } from "swr";
import SelectOnClick from "../components/utils/SelectOnClick";

interface ApplicationInfo {
  kanji_db_path: string;
  srs_db_path: string;
}

export function Component() {
  const { data: info } = useSWR("application_info", () =>
    invoke<ApplicationInfo>("application_info"),
  );

  return (
    <>
      <ul>
        <li>
          Kanji DB path:
          <SelectOnClick>{info?.kanji_db_path}</SelectOnClick>
        </li>
        <li>
          SRS DB path:
          <SelectOnClick>{info?.srs_db_path}</SelectOnClick>
        </li>
      </ul>
    </>
  );
}

Component.displayName = "SettingsPane";
