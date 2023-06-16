import { render } from "@testing-library/react";
import { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

export function wrappedRender(ui: ReactElement) {
  return render(ui, { wrapper: BrowserRouter });
}
