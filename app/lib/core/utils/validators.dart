class Validators {
  static bool isEmail(String email) => RegExp(r'^\S+@\S+\.\S+$').hasMatch(email);
  static bool isNotEmpty(String value) => value.isNotEmpty;
}
