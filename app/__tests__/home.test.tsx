import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";

import Home from "../index";
import { testRouter } from "./testRouter";
import { renderWithProviders } from "@/components/__tests__/renderWithProviders";
import { t } from "@/i18n";
import { useAdsConsentStore } from "@/store/useAdsConsentStore";
import { FREE_SHORTLIST, useShortlistStore } from "@/store/useShortlistStore";
import { usePremiumStore } from "@/store/usePremiumStore";

beforeEach(() => {
  jest.clearAllMocks();
  usePremiumStore.setState({ isPremium: false, isReady: true });
  useAdsConsentStore.setState({
    consent: { canServeAds: true, offerPrivacyOptions: false },
  });
  useShortlistStore.setState({ shortlist: [], partner: [] });
});

describe("the browse screen", () => {
  it("shows a name with its origin and meaning", async () => {
    const { getByText, getAllByText } = await renderWithProviders(<Home />);
    expect(getByText("Emma")).toBeTruthy();
    // Several names share an origin, so that one is expected more than once.
    expect(
      getAllByText(`${t("originLabel")}: Germanic`).length,
    ).toBeGreaterThan(0);
    expect(getByText(`${t("meaningLabel")}: Whole, universal`)).toBeTruthy();
  });

  it("says plainly that it has no popularity rankings", async () => {
    // The claim was changed rather than the data faked, and the screen says why.
    const { getByText } = await renderWithProviders(<Home />);
    expect(getByText(t("noPopularityNote"))).toBeTruthy();
  });

  it("says the sound analysis is based on English spelling", async () => {
    const { getByText } = await renderWithProviders(<Home />);
    expect(getByText(t("englishNote"))).toBeTruthy();
  });

  it("filters by search", async () => {
    const { getByLabelText, queryByText } = await renderWithProviders(<Home />);
    await fireEvent.changeText(getByLabelText(t("searchLabel")), "emm");
    expect(queryByText("Emma")).not.toBeNull();
    expect(queryByText("Leo")).toBeNull();
  });

  it("says so when nothing matches", async () => {
    const { getByLabelText, getByText } = await renderWithProviders(<Home />);
    await fireEvent.changeText(getByLabelText(t("searchLabel")), "qqqqq");
    expect(getByText(t("noResults"))).toBeTruthy();
  });

  it("lets a name outside the curated pool be added directly", async () => {
    // The pool search is not the only source of a name someone wants -- a tester asked for
    // exactly this. "qqqqq" cannot be in the bundled pool by construction.
    const { getByLabelText, getByText } = await renderWithProviders(<Home />);
    await fireEvent.changeText(getByLabelText(t("searchLabel")), "qqqqq");

    await fireEvent.press(getByText(t("addCustomName", { name: "qqqqq" })));

    expect(useShortlistStore.getState().shortlist).toEqual(["qqqqq"]);
  });

  it("shows every shortlisted name, pool-drawn or custom, with a way to remove it", async () => {
    // A custom name never appears in the pool search again once added, so the search-result
    // toggle (above) cannot be how it comes off the list -- this section is the only place
    // every shortlisted name can be seen and removed, which is what a tester asked for.
    useShortlistStore.setState({ shortlist: ["Emma", "A Custom Name"] });
    const { getAllByText, getByText, getByLabelText, queryByText } =
      await renderWithProviders(<Home />);

    // "Emma" is also a pool entry, so it legitimately renders twice (shortlist chip and search
    // result) -- the shortlist-section chip is what the removal button below targets.
    expect(getAllByText("Emma").length).toBeGreaterThanOrEqual(1);
    expect(getByText("A Custom Name")).toBeTruthy();

    await fireEvent.press(
      getByLabelText(t("removeFromShortlist", { name: "A Custom Name" })),
    );

    expect(useShortlistStore.getState().shortlist).toEqual(["Emma"]);
    expect(queryByText("A Custom Name")).toBeNull();
  });

  it("adds a name to the shortlist, and removes it again", async () => {
    const { getByLabelText } = await renderWithProviders(<Home />);
    await fireEvent.press(getByLabelText(t("addToList", { name: "Emma" })));
    expect(useShortlistStore.getState().shortlist).toEqual(["Emma"]);

    const after = await renderWithProviders(<Home />);
    await fireEvent.press(
      after.getByLabelText(t("removeFromList", { name: "Emma" })),
    );
    expect(useShortlistStore.getState().shortlist).toEqual([]);
  });

  it("offers the purchase when a free list is full, and adds nothing", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    useShortlistStore.setState({
      shortlist: Array.from(
        { length: FREE_SHORTLIST },
        (_, i) => `Placeholder${i}`,
      ),
    });

    const { getByLabelText } = await renderWithProviders(<Home />);
    await fireEvent.press(getByLabelText(t("addToList", { name: "Emma" })));

    expect(alert.mock.calls[0]![0]).toBe(t("shortlistLimitTitle"));
    expect(useShortlistStore.getState().shortlist).toHaveLength(FREE_SHORTLIST);
  });

  it("shows a free list against its cap, and a paid one as a bare count", async () => {
    const free = await renderWithProviders(<Home />);
    expect(
      free.getByText(
        t("shortlistCount", { n: "0", max: String(FREE_SHORTLIST) }),
      ),
    ).toBeTruthy();

    usePremiumStore.setState({ isPremium: true });
    const paid = await renderWithProviders(<Home />);
    expect(
      paid.queryByText(
        t("shortlistCount", { n: "0", max: String(FREE_SHORTLIST) }),
      ),
    ).toBeNull();
  });

  it("routes to compare and settings", async () => {
    const { getByText } = await renderWithProviders(<Home />);
    await fireEvent.press(getByText(t("compareTitle")));
    expect(testRouter.push).toHaveBeenCalledWith("/compare");
    await fireEvent.press(getByText(t("settingsTitle")));
    expect(testRouter.push).toHaveBeenCalledWith("/settings");
  });
});
