import { invoke } from "@tauri-apps/api/tauri";
import useSWR from "swr";
import SelectOnClick from "../components/utils/SelectOnClick";
import styles from "./SettingsPane.module.scss";
import { Button, Table, Td, Tr } from "@chakra-ui/react";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

interface ApplicationInfo {
  kanji_db_path: string;
  srs_db_path: string;
}

export function Component() {
  const { data: info } = useSWR("application_info", () =>
    invoke<ApplicationInfo>("application_info"),
  );

  const [version, setVersion] = useState("");
  useEffect(() => {
    getVersion().then((result) => setVersion(result));
  }, []);

  return (
    <main className={styles.main}>
      <Table>
        <Tr>
          <Td>Kanji DB Path</Td>
          <Td>
            <SelectOnClick>{info?.kanji_db_path}</SelectOnClick>
          </Td>
        </Tr>

        <Tr>
          <Td>SRS DB Path</Td>
          <Td>
            <SelectOnClick>{info?.srs_db_path}</SelectOnClick>
          </Td>
        </Tr>

        <Tr>
          <Td>Links</Td>
          <Td>
            <a href="https://git.mzhang.io/michael/houhou" target="_blank" rel="noopener">
              <Button>Source Code</Button>
            </a>
          </Td>
        </Tr>

        <Tr>
          <Td>Version</Td>
          <Td>{version}</Td>
        </Tr>
      </Table>
    </main>
  );
}

Component.displayName = "SettingsPane";
