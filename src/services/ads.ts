import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Google sample ad units. Swapped for real DartSage units only at release —
// loading real ads from a dev build risks AdMob account suspension.
const INTERSTITIAL_UNIT = TestIds.INTERSTITIAL;
const REWARDED_UNIT = TestIds.REWARDED;

const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000;
const MATCHES_PER_INTERSTITIAL = 2;

let initialized = false;
let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let lastInterstitialAt = 0;
let matchesSinceInterstitial = 0;

export async function initializeAds(): Promise<void> {
  if (initialized) {
    return;
  }
  try {
    await AdsConsent.gatherConsent();
    await mobileAds().initialize();
    initialized = true;
    preloadInterstitial();
  } catch (error: unknown) {
    console.warn('Ads initialization failed:', error);
  }
}

function preloadInterstitial(): void {
  const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT);
  interstitial = ad;
  interstitialLoaded = false;
  ad.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    preloadInterstitial();
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  ad.load();
}

// Natural-break placement: called when a match ends. Shows at most one ad
// per MATCHES_PER_INTERSTITIAL finished matches and never within the cooldown.
export function maybeShowInterstitialAfterMatch(): void {
  matchesSinceInterstitial += 1;
  if (!initialized || interstitial === null || !interstitialLoaded) {
    return;
  }
  if (matchesSinceInterstitial < MATCHES_PER_INTERSTITIAL) {
    return;
  }
  if (Date.now() - lastInterstitialAt < INTERSTITIAL_COOLDOWN_MS) {
    return;
  }
  matchesSinceInterstitial = 0;
  lastInterstitialAt = Date.now();
  interstitial.show().catch((error: unknown) => {
    console.warn('Interstitial failed to show:', error);
  });
}

export function showRewardedAd(onReward: () => void, onUnavailable: () => void): void {
  if (!initialized) {
    onUnavailable();
    return;
  }
  const ad = RewardedAd.createForAdRequest(REWARDED_UNIT);
  let rewarded = false;
  ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
    ad.show().catch(() => onUnavailable());
  });
  ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    rewarded = true;
  });
  ad.addAdEventListener(AdEventType.CLOSED, () => {
    if (rewarded) {
      onReward();
    }
  });
  ad.addAdEventListener(AdEventType.ERROR, () => {
    onUnavailable();
  });
  ad.load();
}
