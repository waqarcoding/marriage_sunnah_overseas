class AppConstants {
  // API
  static const String appname = 'Shortflix';
  static const String kieApiBaseUrl = 'https://api.kie.ai/api/v1';
  static const String kieApiKey =
      '18c6aa80d57ef62d74a96508a2fa47a9'; // Replace with your key
  // RevenueCat
  static const String revenueCatApiKeyIOS = 'test_hJlNoKeaRMZsXeqdJvamivIAJzl';
  static const String revenueCatApiKeyAndroid =
      'test_hJlNoKeaRMZsXeqdJvamivIAJzl';

  static const String supabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0anFsZ2x5d3R4aGptbG5lcnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODY1MzgsImV4cCI6MjA4OTg2MjUzOH0.b3HZYn5GEOSwexS3FK0b9fKxyi9Zk63KatY93cw0sPw';
  static const String supabaseUrl = 'https://ftjqlglywtxhjmlnerzg.supabase.co';
  // RevenueCat Entitlements & Products
  static const String premiumEntitlement = 'pro';
  static const String monthlyProductId = 'subscription_monthly';
  static const String yearlyProductId = 'subscription_yearly';
  static const String lifetimeProductId = 'subscription_weekly';

  // ─── Seedance Model ───────────────────────────────────────────────────────────
  // Only one model is supported on this endpoint.
  static const String defaultModel = 'bytedance/seedance-1.5-pro';

  // Kept as a list so the UI chip row still works — single item for now
  static const List<Map<String, String>> seedanceModels = [
    {
      'id': 'bytedance/seedance-1.5-pro',
      'name': 'Seedance 1.5 Pro',
      'badge': 'PRO',
    },
  ];

  // ─── Aspect Ratios — confirmed from API docs ──────────────────────────────────
  static const List<Map<String, String>> aspectRatios = [
    {'value': '16:9', 'label': '16:9', 'icon': '🖥️'},
    {'value': '9:16', 'label': '9:16', 'icon': '📱'},
    {'value': '1:1', 'label': '1:1', 'icon': '⬜'},
    {'value': '4:3', 'label': '4:3', 'icon': '📺'},
    {'value': '3:4', 'label': '3:4', 'icon': '🖼️'},
    {'value': '21:9', 'label': '21:9', 'icon': '🎬'},
  ];
  static const String defaultAspectRatio = '9:16';

  // ─── Resolutions — 720p is default per docs ───────────────────────────────────
  static const List<String> resolutions = ['480p', '720p', '1080p'];
  static const String defaultResolution = '480p';

  // ─── Durations (seconds) — confirmed from API docs: 4, 8, 12 ─────────────────
  static const List<int> durations = [4, 8, 12];
  static const int defaultDuration = 12;

  // ─── Storage Keys ─────────────────────────────────────────────────────────────
  static const String storageVideoList = 'video_list';
  static const String storageApiKey = 'api_key';
  static const String storageOnboarded = 'onboarded';

  // ─── Polling ──────────────────────────────────────────────────────────────────
  static const int pollingIntervalSeconds = 5;
  static const int maxPollingAttempts = 60;

  // ─── Free tier limits ─────────────────────────────────────────────────────────
  static const int freeGenerationsPerDay = 2;

  // ─── Prompt length constraints — from API docs ────────────────────────────────
  static const int promptMinLength = 3;
  static const int promptMaxLength = 2500;

  // ─── Input image constraints ──────────────────────────────────────────────────
  static const int maxInputImages = 2;
  static const int maxImageSizeMB = 10;

  // ─── kie.ai API Status Codes ──────────────────────────────────────────────────
  // kie.ai always returns HTTP 200.
  // The real status lives in body["code"].
  //
  // 200  Success             — request processed successfully
  // 401  Unauthorized        — missing or invalid auth credentials
  // 402  Insufficient Credits — account has insufficient credits
  // 404  Not Found           — requested resource or endpoint does not exist
  // 422  Validation Error    — request parameters failed validation
  // 429  Rate Limited        — request frequency limit exceeded
  // 455  Service Unavailable — system is under maintenance
  // 500  Server Error        — unexpected failure while processing request
  // 501  Generation Failed   — content generation task execution failed
  // 505  Feature Disabled    — requested feature is not currently available
  static const int statusSuccess = 200;
  static const int statusUnauthorized = 401;
  static const int statusInsufficientCredits = 402;
  static const int statusNotFound = 404;
  static const int statusValidationError = 422;
  static const int statusRateLimited = 429;
  static const int statusServiceUnavailable = 455;
  static const int statusServerError = 500;
  static const int statusGenerationFailed = 501;
  static const int statusFeatureDisabled = 505;
}
