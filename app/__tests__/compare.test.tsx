import { fireEvent } from '@testing-library/react-native';
import React from 'react';

import Compare from '../compare';
import { renderWithProviders } from '@/components/__tests__/renderWithProviders';
import { t } from '@/i18n';
import { siblingFit } from '@/logic/sound';
import { useAdsConsentStore } from '@/store/useAdsConsentStore';
import { useShortlistStore } from '@/store/useShortlistStore';
import { usePremiumStore } from '@/store/usePremiumStore';

beforeEach(() => {
  jest.clearAllMocks();
  usePremiumStore.setState({ isPremium: false, isReady: true });
  useAdsConsentStore.setState({ consent: { canServeAds: true, offerPrivacyOptions: false } });
  useShortlistStore.setState({ shortlist: [], partner: [] });
});

describe('the compare screen', () => {
  it('shows a code that contains the list itself', async () => {
    // Nothing is fetched. That is what makes offline comparison and the privacy claim true.
    useShortlistStore.setState({ shortlist: ['Emma', 'Leo'] });
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText('EMMA.LEO')).toBeTruthy();
  });

  it('says the list is empty rather than showing a blank code', async () => {
    const { getAllByText } = await renderWithProviders(<Compare />);
    expect(getAllByText(t('shortlistEmpty')).length).toBeGreaterThan(0);
  });

  it('reads a partner code and shows what both lists hold', async () => {
    useShortlistStore.setState({ shortlist: ['Emma', 'Leo', 'Nina'] });
    const { getByLabelText, getByText } = await renderWithProviders(<Compare />);

    await fireEvent.changeText(getByLabelText(t('partnerCodeLabel')), 'NINA.EMMA');
    await fireEvent.press(getByText(t('compareTitle')));

    expect(useShortlistStore.getState().agreed()).toEqual(['Emma', 'Nina']);
  });

  it('says so when two lists share nothing', async () => {
    useShortlistStore.setState({ shortlist: ['Emma'], partner: ['Leo'] });
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText(t('agreedEmpty'))).toBeTruthy();
  });

  it('scores a sibling name against the shortlist and shows why', async () => {
    useShortlistStore.setState({ shortlist: ['Nina'] });
    const { getByLabelText, getByText } = await renderWithProviders(<Compare />);
    await fireEvent.changeText(getByLabelText(t('siblingPrompt')), 'Emma');

    const fit = siblingFit('Emma', 'Nina');
    expect(getByText(t('fitScore', { n: String(fit.score) }))).toBeTruthy();
    expect(getByText(t('fitSameSyllables'))).toBeTruthy();
  });

  it('calls the score a guide rather than a verdict', async () => {
    const { getByText } = await renderWithProviders(<Compare />);
    expect(getByText(t('fitCaveat'))).toBeTruthy();
  });
});
