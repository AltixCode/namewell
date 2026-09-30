import { fireEvent } from "@testing-library/react-native";
import React from "react";

import Compare from "../compare";
import { renderWithProviders } from "@/components/__tests__/renderWithProviders";
import { t } from "@/i18n";
import { siblingFit } from "@/logic/sound";
import { useAdsConsentStore } from "@/store/useAdsConsentStore";
import { useShortlistStore } from "@/store/useShortlistStore";
import { usePremiumStore } from "@/store/usePremiumStore";

beforeEach(() => {
  jest.clearAllMocks();
  usePremiumStore.setState({ isPremium: false, isReady: true });
  useAdsConsentStore.setState({
    consent: { canServeAds: true, offerPrivacyOptions: false },
  });
  useShortlistStore.setState({ shortlist: [], partner: [] });
});

describe("the compare screen", () => {
  it("shows a code that contains the list itself", async () => {
    // Nothing is fetched. That is what makes offline comparison and the privacy claim true.
    useShortlistStore.setState({ shortlist: ["Emma", "Leo"] });
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText("EMMA.LEO")).toBeTruthy();
  });

  it("says the list is empty rather than showing a blank code", async () => {
    const { getAllByText } = await renderWithProviders(<Compare />);
    expect(getAllByText(t("shortlistEmpty")).length).toBeGreaterThan(0);
  });

  it("reads a partner code and shows what both lists hold", async () => {
    useShortlistStore.setState({ shortlist: ["Emma", "Leo", "Nina"] });
    const { getByLabelText, getByText } = await renderWithProviders(
      <Compare />,
    );

    await fireEvent.changeText(
      getByLabelText(t("partnerCodeLabel")),
      "NINA.EMMA",
    );
    await fireEvent.press(getByText(t("compareTitle")));

    expect(useShortlistStore.getState().agreed()).toEqual(["Emma", "Nina"]);
  });

  it("says so when two lists share nothing", async () => {
    useShortlistStore.setState({ shortlist: ["Emma"], partner: ["Leo"] });
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText(t("agreedEmpty"))).toBeTruthy();
  });

  it("shows the code the still-persisted partner list decodes to, on a fresh mount", async () => {
    // The reported bug: leaving this screen (to add names elsewhere) and coming back remounts
    // it, resetting the local `code` field to "" while the persisted `partner` list -- and the
    // "you both like" results computed live from it -- survive untouched. That read as "the
    // code is gone, but the results are still showing", as if the comparison had half-forgotten
    // itself. `partner` already set before mount, exactly as it would be after a remount.
    useShortlistStore.setState({
      shortlist: ["Emma", "Nina"],
      partner: ["Nina", "Emma"],
    });
    const { getByLabelText, getByText } = await renderWithProviders(
      <Compare />,
    );

    expect(getByLabelText(t("partnerCodeLabel")).props.value).toBe("NINA.EMMA");
    expect(getByText("Emma")).toBeTruthy();
    expect(getByText("Nina")).toBeTruthy();
  });

  it("does not fight a user clearing the code field to retype it", async () => {
    useShortlistStore.setState({ shortlist: ["Emma"], partner: ["Leo"] });
    const { getByLabelText } = await renderWithProviders(<Compare />);
    const input = getByLabelText(t("partnerCodeLabel"));

    await fireEvent.changeText(input, "");

    expect(input.props.value).toBe("");
  });

  it("scores a sibling name against the shortlist and shows why", async () => {
    useShortlistStore.setState({ shortlist: ["Nina"] });
    const { getByLabelText, getByText } = await renderWithProviders(
      <Compare />,
    );
    await fireEvent.changeText(getByLabelText(t("siblingPrompt")), "Emma");

    const fit = siblingFit("Emma", "Nina");
    expect(getByText(t("fitScore", { n: String(fit.score) }))).toBeTruthy();
    expect(getByText(t("fitSameSyllables"))).toBeTruthy();
  });

  it("calls the score a guide rather than a verdict", async () => {
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText(t("fitCaveat"))).toBeTruthy();
  });
});
