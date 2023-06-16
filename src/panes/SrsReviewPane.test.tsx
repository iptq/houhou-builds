import SrsReviewPane from "./SrsReviewPane";
import { wrappedRender } from "../test/setup";
import { vi, Mock } from "vitest";

describe("SrsReviewPane", () => {
  beforeEach(() => {});

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders without exploding", () => {
    wrappedRender(<SrsReviewPane />);
  });
});
