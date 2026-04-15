import 'package:app_history/app_history.dart';
import 'package:app/data/models/user_model.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static bool isFirstRun = false;

  // =========================
  // Keys
  // =========================
  static const String keyJwtToken = "jwt_token";
  static const String keyUserId = "user_id";

  /*
  // =========================
  // History storage
  // =========================
  static final AppHistory<UserModel> history = AppHistory<UserModel>(
    fromJson: (json) => UserModel.fromJson(json),
  );

  // =========================
  // Likes storage
  // =========================
  static final AppHistory<UserModel> likes = AppHistory<UserModel>(
    fromJson: (json) => UserModel.fromJson(json),
  );

*/

  // =========================
  // Initialize storage
  // =========================
  static Future<void> init() async {
    bool firstRun = await checkFirstRun();
    if (firstRun) {
      isFirstRun = true;
      print("First Run ✅");
    }
  }

  // --------------------------
  // Check first run flag
  // --------------------------
  static Future<bool> checkFirstRun() async {
    final prefs = await SharedPreferences.getInstance();
    bool? alreadyRun = prefs.getBool('isFirstRun');

    if (alreadyRun == null || alreadyRun == true) {
      await prefs.setBool('isFirstRun', false);
      return true;
    }
    return false;
  }

  // =========================
  // SharedPreferences Helpers
  // =========================

  /// Set a value in SharedPreferences
  static Future<void> setPref<T>(String key, T value) async {
    final prefs = await SharedPreferences.getInstance();

    if (value is String) {
      await prefs.setString(key, value);
    } else if (value is int) {
      await prefs.setInt(key, value);
    } else if (value is bool) {
      await prefs.setBool(key, value);
    } else if (value is double) {
      await prefs.setDouble(key, value);
    } else if (value is List<String>) {
      await prefs.setStringList(key, value);
    } else {
      throw Exception("Unsupported type");
    }
  }

  /// Get a value from SharedPreferences
  static Future<T?> getPref<T>(String key) async {
    final prefs = await SharedPreferences.getInstance();

    if (T == String) return prefs.getString(key) as T?;
    if (T == int) return prefs.getInt(key) as T?;
    if (T == bool) return prefs.getBool(key) as T?;
    if (T == double) return prefs.getDouble(key) as T?;
    if (T == List<String>) return prefs.getStringList(key) as T?;

    throw Exception("Unsupported type");
  }

  /// Clear all SharedPreferences
  static Future<void> clearPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  // =========================
  // JWT Token helpers
  // =========================

  /// Save JWT token
  static Future<void> setJwtToken(String token) async {
    await setPref<String>(keyJwtToken, token);
  }

  /// Get JWT token
  static Future<String?> getJwtToken() async {
    return await getPref<String>(keyJwtToken);
  }

  /// Remove JWT token
  static Future<void> removeJwtToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyJwtToken);
  }

  /// Save User ID
  static Future<void> setUserId(int userId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(keyUserId, userId);
  }

  /// Get User ID
  static Future<int?> getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt(keyUserId);
  }

  /// Remove User ID
  static Future<void> removeUserId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyUserId);
  }

  /// Sign Out (Remove everything)
  static Future<void> signOut() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyJwtToken);
    await prefs.remove(keyUserId);
  }

  /// ✅ Check login using USER ID
  static Future<bool> isLoggedIn() async {
    final userId = await getUserId();
    final token = await getJwtToken();

    // If either is missing → not logged in
    if (userId == null || token == null || token.isEmpty) {
      print("🔑 USER NOT LOGGED IN YET");
      return false;
    }

    // If token expired → logout
    if (JwtDecoder.isExpired(token)) {
      print("🔑 JWT TOKEN EXPIRED");
      await signOut();
      return false;
    }

    return true;
  }
}
